import mongoose from "mongoose";
import { Practice } from "../types.ts";

const Schema = mongoose.Schema;

const practiceSchema = new Schema(
  {
    name: { type: String, required: true },
    students: { type: Array, required: true },
    computers: { type: Boolean, required: true },
    observation: { type: String, required: true },
    id_course_and_group: { type: String, required: true },
    id_period: { type: String, required: true },
    id_subject: { type: String, required: true }
  },
  { timestamps: true }
);

export type practiceModelType = mongoose.Document & Omit<Practice, "id">

export const practiceModel = mongoose.model<practiceModelType>(
  "Practice",
  practiceSchema
);
