import { PracticeType, Timetable_week } from "../types.ts";
import ollama from 'ollama';
import checkList from "../controllers/checkList.ts"


export default async function generateResponse(order_Practices:PracticeType[],last_week:Timetable_week,present_week:Timetable_week,course:string) {

  console.log("Course",course);
  let prompt:string;
  //let presentString:string;
  console.log("order",order_Practices)
  const list_checked:PracticeType[] = await checkList(order_Practices)
  const orderString = list_checked
  .map(practice => `id_practice: ${practice.id_practice}, duration: ${practice.duration}`)
  .join("; ");

  /*
  presentString="[\n"
    for(let i=0;i<present_week.Week_Timetable.length;i++){
      presentString+="["
      for(let j=0;j<present_week.Week_Timetable[i].length;j++){
        presentString+=present_week.Week_Timetable[i][j]
        if(j<present_week.Week_Timetable[i].length-1){
          presentString+=";"
        }
      }
      presentString+="]"
      if(i<present_week.Week_Timetable.length-1){
        presentString+=";\n"
      }else{
        presentString+="\n"
      }
    }
  presentString+="]"
  */

  const presentString = present_week.Week_Timetable
    .map(row => `[${row.join(";")}]`)
    .join(";\n");

  console.log("last week",last_week)
  if(last_week.Week_Timetable.length==0){
    prompt = `
        Help me manage a weekly calendar by inserting practices into specific time slots in the available time matrix. You are only allowed to insert **the practice IDs** into the available ("Free") time slots, and you must respect the **exact number of consecutive hours** required for each practice.

        ### List of Practices:
        Each practice is separated by a semicolon ';':

        ${orderString}

        ---

        ### Specific Instructions:
        1. Insert IDs Only: Replace "Free" slots in the matrix with the exact id_practice provided. Do not insert any other text or modify any non-"Free" slots.
        2. Consecutive Slots Rule: Only insert practices into rows with enough consecutive "Free" slots to match their duration. For example, a practice with duration: 3 requires 3 consecutive "Free" slots in the same row.
        3. Skip Restricted Slots: Do not overwrite slots labeled "Curso 2." Skip these entirely.
        4. Keep the Matrix Structure: The updated matrix must remain identical in structure to the original, except for replacing "Free" slots with practice IDs. Do not modify any other parts of the matrix.
        5. Order of Practices: Insert practices in the exact order provided in the list. Do not rearrange or skip any practices.
        6. Separation Rule: If two practices belong to the same subject or course, ensure they are separated by at least one row (week) in the schedule.
        7. Minimum Practices: You are not required to insert all the practices. However, you must insert at least three practices into the matrix.

        ---

        ### Weekly Schedule Matrix:

        Here is the matrix where practices must be inserted. Each slot is separated by a semicolon (;). If a slot contains a comma (,), it represents a shared space between multiple courses and should be interpreted as "Bussy" :

        [
        ${presentString}
        ]

        ---

        ### Response Format:
        - Updated Matrix Only: Provide only the updated matrix with the practices inserted.
        - Only Return the Updated Matrix. Do not include additional details, explanations, or text in your response.
        - Same Dimensions: Ensure the updated matrix has the same size and structure as the original.
        - Single String Response: Return the matrix as a single string without any unnecessary formatting or additional text.

      `;
  }else{
    const lastString = last_week.Week_Timetable
    .map(row => `[${row.join(";")}]`)
    .join(";\n");
    prompt = `
        Help me manage a weekly calendar by inserting practices into specific time slots in the available time matrix. You are only allowed to insert **the practice IDs** into the available ("Free") time slots, and you must respect the **exact number of consecutive hours** required for each practice.

        ### List of Practices:
        Each practice is separated by a semicolon ';':

        ${orderString}


        ---

        ### Specific Instructions:
        1. Insert IDs Only: Replace "Free" slots in the matrix with the exact id_practice provided. Do not insert any other text or modify any non-"Free" slots.
        2. Consecutive Slots Rule: Only insert practices into rows with enough consecutive "Free" slots to match their duration. For example, a practice with duration: 3 requires 3 consecutive "Free" slots in the same row.
        3. Skip Restricted Slots: Do not overwrite slots labeled "Curso 2." Skip these entirely.
        4. Keep the Matrix Structure: The updated matrix must remain identical in structure to the original, except for replacing "Free" slots with practice IDs. Do not modify any other parts of the matrix.
        5. Order of Practices: Insert practices in the exact order provided in the list. Do not rearrange or skip any practices.
        6. Separation Rule: If two practices belong to the same subject or course, ensure they are separated by at least one row (week) in the schedule.
        7. Minimum Practices: You are not required to insert all the practices. However, you must insert at least three practices into the matrix.

        ---

        ### Weekly Last Schedule Matrix:

        Here is the last week's schedule matrix. Each slot is separated by a semicolon (;).

        [
        ${lastString}
        ]

        --

        ### Weekly Schedule Matrix:

        Here is the matrix where practices must be inserted. Each slot is separated by a semicolon (;). If a slot contains a comma (,), it represents a shared space between multiple courses and should be interpreted as "Bussy" :

        [
        ${presentString}
        ]

        ---

        ### Response Format:
        - Updated Matrix Only: Provide only the updated matrix with the practices inserted.
        - Only Return the Updated Matrix. Do not include additional details, explanations, or text in your response.
        - Same Dimensions: Ensure the updated matrix has the same size and structure as the original.
        - Single String Response: Return the matrix as a single string without any unnecessary formatting or additional text.
       `;
  }
  console.log(prompt);
  const modelfile = `
    FROM llama3.2:1b
    SYSTEM "Creador de calendarios de prácticas para grado universitario, con horarios de las clases del semestre y las aulas disponibles."
  `;
  try {
    const models = await ollama.list();

    // Verificar si el modelo "Calendar:latest" existe, si no, lo crea
    if (!models.models.find(model => model.model === "Calendar:latest")) {
      await ollama.create({ model: "Calendar", modelfile });
    }

    const MAX_RETRIES = 5;  // Número máximo de intentos
    let attempt = 0;
    let response;
    let updatedMatrix;

    while (attempt < MAX_RETRIES) {
      try {
        // Intentar generar la respuesta del modelo
        response = await ollama.generate({ model: "Calendar", prompt });
        console.log(response.response);

        // Verificar si la respuesta es válida (string no vacío)
        if (response.response && typeof response.response === "string") { //Habría que comprobar que fuera una matriz el string y que el resultado fuese como la matriz del principio
          // Respuesta válida, salir del bucle
          const cleanedResponse = response.response.trim().replace(/^\[|\]$/g, '');
          updatedMatrix  = cleanedResponse.trim().split(";\n").map(row => row.split(";"));

           // Validar dimensiones de la matriz
          const originalMatrix = present_week.Week_Timetable;
          const rowsMatch = updatedMatrix.length === originalMatrix.length;
          const colsMatch = updatedMatrix.every((row, index) =>
            row.length === originalMatrix[index]?.length
          );

          if (rowsMatch && colsMatch) {
            // Matriz válida, salir del bucle
            break;
          } else {
            throw new Error("Response matrix dimensions do not match the original matrix");
          }
        } else {
          throw new Error("Invalid response format"); // Lanza error si la respuesta no es válida
        }
      } catch (error) {
        console.error(`Error on attempt ${attempt + 1}: ${error.message}`);

        // Incrementar el contador de intentos
        attempt++;

        if (attempt >= MAX_RETRIES) {
          console.error("Maximum retries reached. Returning error.");
          throw new Error("Failed to get a valid response after multiple attempts.");
        }

        // Volver a intentar
        console.log("Retrying...");
      }
    }

    // Filtrar las prácticas que no han sido añadidas a la matriz actualizada
    const notAddedPractices = order_Practices.filter(practice =>
      !updatedMatrix.some(row => row.includes(practice.id_practice))
    );

    return { updatedMatrix, notAddedPractices };

  } catch (error) {
    console.error("Error generating response:", error);

    return { message: error};
  }
}
