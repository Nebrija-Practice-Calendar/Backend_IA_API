import mongoose from "mongoose";
import { Semester } from "../types.ts";

const Schema = mongoose.Schema;

const semesterSchema = new Schema(
  {
    name: { type: String, required: true }
  },
  { timestamps: true }
);

export type semesterSchemaModelType = mongoose.Document & Omit<Semester, "id">

export const semesterModel = mongoose.model<semesterSchemaModelType>(
  "Semester",
  semesterSchema
);
