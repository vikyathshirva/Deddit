import "reflect-metadata";
import {MikroORM} from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config"
import express from 'express'
import {ApolloServer} from 'apollo-server-express';
import {buildSchema } from 'type-graphql'; 
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis'
import { MyContext } from "./types";

declare module 'express-session' {
    export interface SessionData {
        userId: number;
    }
}




const main = async () => {
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();
    const app = express();
    const RedisStore = connectRedis(session)
    const redisClient = redis.createClient()

    app.use(
        session({
            name : 'qid',
            store: new RedisStore({ 
                client: redisClient,
                disableTouch : true,
             }),
             cookie: {
                maxAge:  1000 * 60 * 60 * 24 * 365 * 10, // 10 years in milliseconds
                 httpOnly : true,
                 secure : __prod__,
                 sameSite: 'lax' 

             },
            saveUninitialized: false,
            secret: 'keyboasdfasdfaat',
            resave: false,
        })
    )
    const apolloserver = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver,PostResolver,UserResolver],
            validate : false,
        }), 
        context:({req, res}) : MyContext  => ({ em: orm.em, req,res })
    });

    apolloserver.applyMiddleware({ app});
    
    app.listen(4000, ()=>{
        console.log('server started on localhost:4000');
    })
};



main().catch((err)=>{
    console.error(err);
})

console.log("hello there");


