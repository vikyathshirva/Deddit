
import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts (@Ctx() {em}: MyContext): Promise<Post[]> {
        return em.find(Post,{});
    }


    @Query(() => Post, {nullable: true})
    post(
        @Arg ('id',()=> Int) id: number,
        @Ctx() { em }: MyContext
        ): Promise<Post|null> {
        return em.findOne(Post, {id});
    }

    @Mutation(() => Post)
    createPost (
        @Arg('title') title: string,
        @Ctx() { em }: MyContext
    ): Promise<Post | null> {
        const posts = em.create(Post,{title})
        return em.findOne(Post, { title });
    }
    
}