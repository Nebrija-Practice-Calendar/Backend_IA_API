import mongoose from "mongoose";
import { ErrorType } from "../types.ts";


const Schema = mongoose.Schema;

const errorSchema = new Schema(
  {
    name: { type: String, required: true },
    message: { type: String, required: true },
    json: { type: JSON, required: true }
  },
  { timestamps: true }
);

export type errorModelType = mongoose.Document & Omit<ErrorType, "id">

export const errorModel = mongoose.model<errorModelType>(
  "ErrorType",
  errorSchema
);
