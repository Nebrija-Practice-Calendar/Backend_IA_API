import { Courses_and_GroupsModel } from "../db/courses_and_groups.ts";
import { courseModel } from "../db/course.ts";
import { practiceModel } from "../db/practice.ts";
import { Practices_Timetables } from "../types.ts";
import { ExceptionModel } from "../db/exception.ts";
import { SubjectModel } from "../db/subject.ts";
import { PeriodModel } from "../db/period.ts";


type Timetable= {
    id:number,
    Week_Timetable:(string|string[])[][]
}

export default async function getAvailableHoursTransform(practice_calendar: Practices_Timetables) {
    try {
        const coursesGroups = await Courses_and_GroupsModel.find().exec();
        const course = await courseModel.find().exec();
        const practice = await practiceModel.find({ id_period: practice_calendar.id_period }).exec();
        const exceptions = await ExceptionModel.find({ id_period: practice_calendar.id_period }).exec();
        //const subjects = await SubjectModel.find({id_semester:period?.id_semester}).exec();
        // Iteramos sobre cada Timetable
        practice_calendar.Timetables.forEach((timetable: Timetable) => {
            // Iteramos sobre los días de la semana
            timetable.Week_Timetable.forEach((daySubjects: (string | string[])[], hourIndex: number) => {
                daySubjects.forEach((subject, dayIndex: number) => {
                    let courseNames = '';

                    if (Array.isArray(subject)) {
                        // Cuando el subject es un array de IDs (varios cursos)
                        const ids = subject as string[];
                        const names = ids.flatMap((idString) => {
                            const separatedIds = idString.split(",").map(id => id.trim());
                            return separatedIds.map(id => {
                                const courseAndGroup = coursesGroups.find(cg => cg._id.toString() === id);
                                const courseName = course.find(c => c.id_course_and_group.includes(courseAndGroup?._id));
                                return courseName ? courseName.name : 'Unknown';
                            });
                        });
                        courseNames = Array.from(new Set(names.filter(Boolean))).join(", ");
                    } else {
                        const courseAndGroup = coursesGroups.find(cg => cg._id.toString() === subject);
                        if (!courseAndGroup) {
                            const coursePractice = practice.find(p => p._id.toString() === subject);
                            if (coursePractice) {
                                courseNames = `Bussy`;
                            } else {
                                const exception = exceptions.find(e => e._id.toString() === subject);
                                courseNames = exception ? exception.name : 'Free';
                            }
                        } else {
                            const courseData = course.find(c => c.id_course_and_group.includes(courseAndGroup._id));
                            courseNames = courseData ? courseData.name : 'Unknown';
                        }
                    }

                    // Actualizamos la celda con el nombre del curso
                    timetable.Week_Timetable[hourIndex][dayIndex] = courseNames;
                });
            });
        });

        return practice_calendar;
    } catch (e) {
        console.error(e);
        throw new Error("Error al transformar las horas disponibles.");
    }
}
