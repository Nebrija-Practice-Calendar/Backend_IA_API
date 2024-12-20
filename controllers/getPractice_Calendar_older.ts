import { Practices_TimetablesModel } from "../db/practices_timetables.ts";


export default async function getPractice_Calendar_older(id_period: string, id_classroom: string) {
    const practiceTimetable = await Practices_TimetablesModel.findOne({ id_period:id_period,id_classroom:id_classroom }).exec();
    if (!practiceTimetable) {
      return ({ message: "No se encontró el calendario" });
    }
    return practiceTimetable as Practices_Timetables;
}
