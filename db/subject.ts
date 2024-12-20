import mongoose from "mongoose";
import { Subject } from "../types.ts";

const Schema = mongoose.Schema;

const subjectSchema = new Schema(
  {
    name: { type: String, required: true },
    id_course: { type: String, required: true },
    id_semester: { type: String, required: true },
    //id_degree: { type: String, required: true },
    code: { type: String, required: true },
    colour: { type: String, required: true }
  },
  { timestamps: true }
);

export type SubjectModelType = mongoose.Document & Omit<Subject, "id">

export const SubjectModel = mongoose.model<SubjectModelType>(
  "Subject",
  subjectSchema
);
