import mongoose from "mongoose";
import { Practices_Timetables } from "../types.ts";

const Schema = mongoose.Schema;

const practices_TimetablesSchema = new Schema(
  {
    id_period: { type: String, required: true },
    id_classroom: { type: String, required: true },
    automatedIA: { type: Boolean, default: false },
    Timetables: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

export type Practices_TimetablesModelType = mongoose.Document & Omit<Practices_Timetables, "id">

export const Practices_TimetablesModel = mongoose.model<Practices_TimetablesModelType>(
  "Practices_Timetables",
  practices_TimetablesSchema
);
