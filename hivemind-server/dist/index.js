"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
require("dotenv/config");
const apollo_server_core_1 = require("apollo-server-core");
const express_session_1 = __importDefault(require("express-session"));
const redis_1 = require("redis");
const connect_redis_1 = __importDefault(require("connect-redis"));
const cors_1 = __importDefault(require("cors"));
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const setup = async () => {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    await orm.getMigrator().up();
    const generator = orm.getSchemaGenerator();
    await generator.updateSchema();
    const port = 3000;
    const app = (0, express_1.default)();
    let RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    let redisClient = (0, redis_1.createClient)({ legacyMode: true });
    redisClient.connect().catch(console.error);
    app.use((0, cors_1.default)({
        origin: ["http://localhost:3000", "https://studio.apollographql.com"],
        credentials: true,
    }));
    app.use((0, express_session_1.default)({
        name: "cookie",
        store: new RedisStore({
            client: redisClient,
            disableTouch: true,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365,
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        },
        saveUninitialized: false,
        secret: "KKKKKKKKkkkkkakakaaak",
        resave: false,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [post_1.PostResolver, user_1.UsereResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ em: orm.em, req, res }),
        plugins: [apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground],
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });
    app.listen(port, () => {
        console.log(`Server Listening on port :${port}`);
    });
};
setup();
//# sourceMappingURL=index.js.map