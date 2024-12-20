import mongoose from "mongoose";
import { Classroom } from "../types.ts";

const Schema = mongoose.Schema;

const classroomSchema = new Schema(
  {
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    computers: { type: Boolean, required: true }
  },
  { timestamps: true }
);

export type classroomSchemaModelType = mongoose.Document & Omit<Classroom, "id">

export const classroomModel = mongoose.model<classroomSchemaModelType>(
  "Classroom",
  classroomSchema
);
