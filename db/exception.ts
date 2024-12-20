import mongoose from "mongoose";
import { Exception } from "../types.ts";

const Schema = mongoose.Schema;

const exceptionSchema = new Schema(
    {
      name: { type: String, required: true },
      id_period: { type: String, required: true },
      start_date: { type: Date, required: true },
      end_date: { type: Date, required: true },
    },
    { timestamps: true }
  );

  export type ExceptionModelType = mongoose.Document & Omit<Exception, "id">

  export const ExceptionModel = mongoose.model<ExceptionModelType>(
    "exception",
    exceptionSchema
  );
