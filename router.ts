import { Router } from "express";
import { postModel } from "./resolvers/Post/postModel.ts";


export const router = Router();

router
    .post("/postModel", postModel);
