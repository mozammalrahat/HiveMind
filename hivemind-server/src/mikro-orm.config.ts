import path from "path";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import { User } from "./entities/User";
export default {
  migrations: {
    path: path.join(__dirname + "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  user: "mozammal",
  password: "mozammal",
  entities: [Post, User],
  dbName: "hivemind",
  type: "postgresql",
  debug: !__prod__,
  allowGlobalContext: true,
} as Parameters<typeof MikroORM.init>[0];
