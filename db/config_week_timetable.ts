import mongoose from "mongoose";
import { Config_Week_Timetable } from "../types.ts";


const Schema = mongoose.Schema;

const config_week_timetableSchema = new Schema(
  {
    hour: { type: String, required: true },
    hours: {type: Number, required: true},
    minutes: {type: Number, required: true},
    generateHours: { type: [String], required: true },
    generateDays: { type: [String], required: true }
  },
  { timestamps: true }
);

export type config_week_timetableModelType = mongoose.Document & Omit<Config_Week_Timetable, "id">

export const config_week_timetableModel = mongoose.model<config_week_timetableModelType>(
  "Config_Week_Timetable",
  config_week_timetableSchema
);
