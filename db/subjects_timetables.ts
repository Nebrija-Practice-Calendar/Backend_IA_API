import mongoose from "mongoose";
import { Subjects_Timetables } from "../types.ts";

const Schema = mongoose.Schema;

const subjects_TimetablesSchema = new Schema(
  {
    id_period: { type: String, required: true },
    id_course: { type: String, required: true },
    Timetables: { type: [[String]], required: true }
  },
  { timestamps: true }
);

export type Subjects_TimetablesModelType = mongoose.Document & Omit<Subjects_Timetables, "id">

export const Subjects_TimetablesModel = mongoose.model<Subjects_TimetablesModelType>(
  "Subjects_Timetables",
  subjects_TimetablesSchema
);
