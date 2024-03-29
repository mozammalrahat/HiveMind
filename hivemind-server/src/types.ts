import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response, Express } from "express";

export type MyContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session: Express.Session };
  res: Response;
};
