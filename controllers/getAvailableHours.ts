import { Subjects_TimetablesModel } from "../db/subjects_timetables.ts";
import { Practices_TimetablesModel } from "../db/practices_timetables.ts";
import { config_week_timetableModel } from "../db/config_week_timetable.ts";
import { ExceptionModel } from "../db/exception.ts";
import { PeriodModel } from "../db/period.ts";
import { Practices_Timetables} from "../types.ts";


async function config_week(): Promise<{maxDays:number,maxHours:number}> {
  const config_week = await config_week_timetableModel.findOne().exec();
  if(!config_week){
    return { maxDays: 0, maxHours: 0 };
  }
  const maxDays = config_week.generateDays.length;
  const maxHours = config_week.hours;
  return {maxDays,maxHours};
}
async function ocupateCalendar(id_period:string,maxDays:number,maxHours:number): Promise<(string | string[])[][]> {
  const coursesGroups = await Subjects_TimetablesModel.find({ id_period }).exec();
  if (!coursesGroups || coursesGroups.length === 0) {
    return [];
  }
  const availabilityArray: (string | string[])[][] = Array.from({ length: maxDays }, () =>
      Array.from({ length: maxHours }, () => "-")
  );
  coursesGroups.forEach(course => {
    course.Timetables.forEach((timetable, dayIndex) => {
        timetable.forEach((subject, hourIndex) => {
            // Si el hueco está ocupado
            if (subject !== "-") {
                const currentValue = availabilityArray[dayIndex][hourIndex];

                // Si está vacío, simplemente asignamos el id_course
                if (currentValue === "-") {
                    availabilityArray[dayIndex][hourIndex] = course.id_course;
                } else if (typeof currentValue === "string") {
                    // Si ya hay un id_course (string), creamos un array con ambos
                    availabilityArray[dayIndex][hourIndex] = [currentValue, course.id_course];
                } else if (Array.isArray(currentValue)) {
                    // Si ya es un array, agregamos el nuevo id_course al array
                    currentValue.push(course.id_course);
                }
            }
        });
    });
  });

  return availabilityArray;
}

async function getClassCalendar(id_period:string,id_classroom:string,availabilityArray:(string | string[])[][]): Promise<Practices_Timetables> {
  const practiceTimetable = await Practices_TimetablesModel.findOne({ id_period:id_period,id_classroom:id_classroom }).exec();

  if (!practiceTimetable) {
    return {
        id: "",
        id_period,
        id_classroom,
        Timetables: [{
            id: 0,
            Week_Timetable: Array.from({ length: 0 }, () => Array.from({ length: 0 }, () => "-"))
        }]
    }
  }
  practiceTimetable.Timetables.forEach((timetable) => {
    timetable.Week_Timetable.forEach((row, hour) => {
      row.forEach((timeSlot, day) => {
        if (availabilityArray[hour] && availabilityArray[hour][day]) {
          const availabilitySlot = availabilityArray[hour][day];
          if (timeSlot === "-") {
            if (availabilitySlot === "-") {
              timetable.Week_Timetable[hour][day] = "-";
            } else {
              timetable.Week_Timetable[hour][day] = Array.isArray(availabilitySlot) ? [availabilitySlot.join(", ")] : [availabilitySlot];
            }
          } else {
            timetable.Week_Timetable[hour][day] = timeSlot;
          }
        }
      });

    });
  });
  return practiceTimetable as Practices_Timetables;
}

async function getExceptionsDays(id_period: string, practiceTimetable: Practices_Timetables, maxDays: number, maxHours: number): Promise<Practices_Timetables> {
  // Buscar el periodo
  const period = await PeriodModel.findById(id_period).exec();
  if (!period) {
    return practiceTimetable;
  }

  // Buscar excepciones y mapear a tipo Exception
  const exceptions = await ExceptionModel.find({ id_period: period._id }).exec();

  if (!exceptions || exceptions.length === 0) {
    return practiceTimetable;
  }

  // Convertir las fechas del periodo a objetos Date
  const startDatePeriod = new Date(period.start_date);
  const endDatePeriod = new Date(period.end_date);

  exceptions.forEach((exception) => {
    const startDateException = new Date(exception.start_date);
    const endDateException = new Date(exception.end_date);

    // Asegurarse de que la excepción esté dentro del periodo
    if (startDateException > endDatePeriod || endDateException < startDatePeriod) {
      return; // Si la excepción está fuera del periodo, saltarla
    }

    // Ajustar el rango de la excepción para estar dentro del periodo
    const validStartDate = startDateException < startDatePeriod ? startDatePeriod : startDateException;
    const validEndDate = endDateException > endDatePeriod ? endDatePeriod : endDateException;

    // Calcular los días afectados dentro del periodo
    const daysFromStartOfPeriod = (Math.floor((validStartDate.getTime() - startDatePeriod.getTime()) / (1000 * 60 * 60 * 24)));
    const daysToEndOfException = (Math.floor((validEndDate.getTime() - startDatePeriod.getTime()) / (1000 * 60 * 60 * 24)));


    // Iterar sobre las semanas del timetable
    practiceTimetable.Timetables.forEach(week => {
      // Calcular el índice de día en el timetable para las fechas de la excepción
      console.log("Semana:", week.id);
      if (!Array.isArray(week.Week_Timetable)) {
        console.error("Week_Timetable no es un array o no está definido para la semana:", week.id);
        return;
      }

      for (let dayIndex = daysFromStartOfPeriod; dayIndex <= daysToEndOfException; dayIndex++) {
        const weekIndex = Math.floor(dayIndex / 7) + 1;
        const dayOfWeekIndex = dayIndex % 7;

        if (week.id === weekIndex) {

          if(dayOfWeekIndex < maxDays){
            week.Week_Timetable[dayOfWeekIndex].forEach((_hour, hourIndex) => {
              if (hourIndex < maxHours) {
                week.Week_Timetable[dayOfWeekIndex][hourIndex] = exception._id.toString();
              }
            });
          }
        }
      }
    });
  });

  return practiceTimetable;
}


export  default async function getAvailableHours(id_classroom: string, id_period: string) {
  try {

    if (!id_period) {
      return ({ message: "Bad request: missing id_period parameter" });
    }

    const { maxDays, maxHours } = await config_week();

    if (maxDays === 0 || maxHours === 0) {
      return ({ message: "No se encontró la configuración de la semana" });
    }

    const availabilityArray = await ocupateCalendar(id_period,maxDays,maxHours);

    if(availabilityArray.length === 0){
      return ({ message: "No se encontraron horarios para la selección actual." });
    }

    const practiceTimetable = await getClassCalendar(id_period,id_classroom,availabilityArray);
    if(!practiceTimetable){
      return ({ message: "No se encontró la práctica" });
    }
    //Aquí Implementar la lógica de las excepciones
    const practiceTimetableWithExceptions = await getExceptionsDays(id_period,practiceTimetable,maxDays,maxHours);
    //console.log("Objeto practiceTimetable con excepciones:", practiceTimetableWithExceptions);
    if(!practiceTimetableWithExceptions.Timetables[0].Week_Timetable.length===null){
      return ({ message: "No se encontró la práctica" });
    }
    return ({practiceTimetableWithExceptions})
  } catch (error) {
    console.error("Error al obtener horas disponibles:", error);
    return ({ message: "Error interno del servidor", error: error.message });
  }
};
