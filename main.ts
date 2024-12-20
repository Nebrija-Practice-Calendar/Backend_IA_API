import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { router } from "./router.ts";


const MONGO_URL = Deno.env.get("MONGO_URL");

if (!MONGO_URL) {
  console.log("No mongo URL found");
  Deno.exit(1);
}

await mongoose.connect(MONGO_URL);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.listen(3002, () => {
      console.log("Server is running on port 3002");
});




