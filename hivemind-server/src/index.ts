import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import "reflect-metadata";
import { UsereResolver } from "./resolvers/user";
import { createClient } from "redis";
import session from "express-session";
import RedisStore from "connect-redis";
import { MyContext } from "./types";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const generator = orm.getSchemaGenerator();
  await generator.updateSchema();

  const app = express();

  const redisClient = createClient();
  let redisStore = new RedisStore({
    client: redisClient,
    prefix: "myapp",  // prefix for session name in redis
    disableTouch: true, // disable touch to prevent session from expiring
  });

  app.use(
    session({
      name: "qid",
      store: redisStore,
      cookie:{
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, // JS frontend cannot access cookie
        sameSite: "lax", // csrf 
        secure: __prod__, // cookie only works in https
      }
      secret: "randomstring",
      saveUninitialized: true,
      resave: false, // if false, it will not save session if nothing is changed
    })
  );

  //   const post = orm.em.fork().create(Post, {
  //     title: "1st Post",
  //   } as RequiredEntityData<Post>);
  //   await orm.em.persistAndFlush(post);

  // const posts = await orm.em.find(Post, {});
  // console.log(posts);

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UsereResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }), // em: entity manager
  });
  
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  app.listen(3000, () => {
    console.log("Hivemind server running on port 3000");
  });
};

main();
