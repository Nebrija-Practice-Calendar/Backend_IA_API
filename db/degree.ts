import mongoose from "mongoose";
import { Degree } from "../types.ts";

const Schema = mongoose.Schema;

const degreeSchema = new Schema(
  {
    name: { type: String, required: true }
  },
  { timestamps: true }
);

export type degreeSchemaModelType = mongoose.Document & Omit<Degree, "id">

export const degreeModel = mongoose.model<degreeSchemaModelType>(
  "Degree",
  degreeSchema
);
