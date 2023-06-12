import { MikroORM } from "@mikro-orm/core";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import "dotenv/config";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import session from "express-session";
import { createClient } from "redis";
import connectRedis from "connect-redis";
import cors from "cors";
import mikroOrmConfig from "./mikro-orm.config";
import { PostResolver } from "./resolvers/post";
import { UsereResolver } from "./resolvers/user";
import { MyContext } from "./types";

const setup = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const generator = orm.getSchemaGenerator();
  await generator.updateSchema();

  const port = 3000;
  const app = express();

  let RedisStore = connectRedis(session);
  let redisClient = createClient({ legacyMode: true });
  redisClient.connect().catch(console.error);
  app.use(
    cors({
      origin: ["http://localhost:3000", "https://studio.apollographql.com"],
      credentials: true,
    })
  );
  // app.use(cors());
  app.use(
    session({
      name: "cookie",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365, //1year
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
      saveUninitialized: false,
      secret: "KKKKKKKKkkkkkakakaaak",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UsereResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(port, () => {
    console.log(`Server Listening on port :${port}`);
  });
};

setup();
