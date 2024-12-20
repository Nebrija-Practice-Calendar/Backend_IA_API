import { Request, Response } from 'express';
import { courseModel } from "../../db/course.ts";
import { QuestionType,PracticeType,Timetable_week,Practices_Timetables } from "../../types.ts";
import  getAvailableHours  from "../../controllers/getAvailableHours.ts";
import  getAvailableHoursTransform  from "../../controllers/getAvaiableHoursTransform.ts";
import  orderPractices from "../../controllers/orderPractices.ts";
import generateResponse from "../../model/generateResponse.ts";
import getPractice_Calendar_older from "../../controllers/getPractice_Calendar_older.ts";

export const postModel = async (req: Request, res: Response) => {
  try{

    const request: QuestionType = req.body;
    if (!request) {
      return res.status(400).send('Request is required');
    }
    const course= await courseModel.findById(request.id_course).exec();
    if (!course) {
      return res.status(404).send('Course not found');
    }

    //Obtener las practicas
    const order_Practices:PracticeType[] = await orderPractices(request.subjects);
    if(!order_Practices){
      res.status(404).send('Practices not found');
    }

    //Mirar la disponibilidad de la aula
    const availableHours = await getAvailableHours(request.id_classroom, request.id_period);
    if (availableHours.message) {
      return res.status(404).send(availableHours.message);
    }
    if (!availableHours.practiceTimetableWithExceptions) {
      return res.status(404).send('Practice timetable with exceptions not found');
    }
    //Transformar las horas disponibles
    const transformAvailableHours = await getAvailableHoursTransform(availableHours.practiceTimetableWithExceptions);

    const practice_calendar_older:Practices_Timetables = await getPractice_Calendar_older(request.id_period, request.id_classroom);

    let week_calendar:Timetable_week[] = [];
    let last_week:Timetable_week={
      id: 0,
      Week_Timetable: []
    };
    let rest_order_Practices:PracticeType[]=order_Practices;//Espacio donde tener las prácticas que faltan por introducir
    //Crear bucle para añadir las prácticas mediante la IA
    for (let i = 0; i < transformAvailableHours.Timetables.length; i++) {//Retocar el Bucle
      //Pensar como enviar un last_week que sea nulo si no hay semana anterior o se inicializa
      const present_week:Timetable_week = transformAvailableHours.Timetables[i]
      const generateCalendar = await generateResponse(rest_order_Practices,last_week,present_week,course.name);
      if(generateCalendar.message){
        throw new Error(generateCalendar.message);
      }
      const week_Response=generateCalendar.updatedMatrix;
      //Sacar las prácticas de esa semana y unirlas
      week_calendar.push({
        id: i + 1,
        Week_Timetable:week_Response
      });
      rest_order_Practices=generateCalendar.notAddedPractices;
      if(rest_order_Practices.length===0){//Si ya no quedan prácticas por introducir
        //Coger de transformAvailableHours.Timetables donde el id sea i+2 hasta el final del array donde sería de tipoWeek_Time
        const remainingWeeks = transformAvailableHours.Timetables
          .filter((_, index) => index > i + 1)
          .map((week, index) => ({
            id: i + 2 + index, // Ajustar ID de forma consecutiva
            Week_Timetable: week.Week_Timetable
          }));

        week_calendar.push(...remainingWeeks);
        break;
      }
      last_week={
        id: i + 1,
        Week_Timetable: week_Response
      }
    }
    const newCreatedCalendar:Practices_Timetables = {
      id:practice_calendar_older.id,
      id_period: request.id_period,
      id_classroom: request.id_classroom,
      automatedIA: true,
      Timetables: week_calendar
    }

    res.status(200).json(newCreatedCalendar);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error|| "An unexpected error occurred",
    });
  }
};
