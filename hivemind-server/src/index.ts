import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";
// import { PostgreSqlDriver } from "@mikro-orm/postgresql";
const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const generator = orm.getSchemaGenerator();
  await generator.updateSchema();

  //   const post = orm.em.fork().create(Post, {
  //     title: "1st Post",
  //   } as RequiredEntityData<Post>);
  //   await orm.em.persistAndFlush(post);

  const posts = await orm.em.find(Post, {});
  console.log(posts);
};

main();
