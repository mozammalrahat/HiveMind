import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import "reflect-metadata";
import { UsereResolver } from "./resolvers/user";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const generator = orm.getSchemaGenerator();
  await generator.updateSchema();

  const app = express();

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
    context: () => ({ em: orm.em }), // can also add req and res here.
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  app.listen(3000, () => {
    console.log("Hivemind server running on port 3000");
  });
};

main();
