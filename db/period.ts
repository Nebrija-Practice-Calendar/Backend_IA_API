import mongoose from "mongoose";
import { Period } from "../types.ts";

const Schema = mongoose.Schema;

const periodSchema = new Schema(
  {
    name: { type: String, required: true },
    id_semester: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
  },
  { timestamps: true }
);

export type PeriodModelType = mongoose.Document & Omit<Period, "id">

export const PeriodModel = mongoose.model<PeriodModelType>(
  "Period",
  periodSchema
);
