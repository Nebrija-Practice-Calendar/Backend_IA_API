import mongoose from "mongoose";
import { Course } from "../types.ts";

const Schema = mongoose.Schema;

const courseSchema = new Schema(
  {
    name: { type: String, required: true },
    id_course_and_group: { type: [String], required: true }
  },
  { timestamps: true }
);

export type courseModelType = mongoose.Document & Omit<Course, "id">

export const courseModel = mongoose.model<courseModelType>(
  "course",
  courseSchema
);
