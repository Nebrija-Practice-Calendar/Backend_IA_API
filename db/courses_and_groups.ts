import mongoose from "mongoose";
import { Courses_and_Groups } from "../types.ts";

const Schema = mongoose.Schema;

const courses_and_GroupsSchema = new Schema(
  {
    name: { type: String, required: true }
  },
  { timestamps: true }
);

export type Courses_and_GroupsModelType = mongoose.Document & Omit<Courses_and_Groups, "id">

export const Courses_and_GroupsModel = mongoose.model<Courses_and_GroupsModelType>(
  "Courses_and_Groups",
  courses_and_GroupsSchema
);
