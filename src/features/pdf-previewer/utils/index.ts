import { Annotation } from "../components/PdfPreviewer";
import { tailwindColors } from "../constants";
import { IFieldValueSchema } from "../dtos/extract-response-dto";

type ColorShade = 50 | 500;

type TailwindColor = keyof typeof tailwindColors;

function getTailwindColor(
  color: TailwindColor,
  shade: ColorShade = 500,
): string {
  if (!tailwindColors[color] || !tailwindColors[color][shade]) {
    // throw new Error("Invalid color or shade");
  }
  return tailwindColors[color][shade];
}

// Function to add or update an object in the string
const addUpdateInString = (str: string, newItem: Annotation): string => {
  // Parse the string into an array (handle empty string case)
  const dataArray: Annotation[] = str ? JSON.parse(str) : [];

  // Find index of the object with the same id
  const index = dataArray.findIndex((item) => item.fieldId === newItem.fieldId);

  if (index !== -1) {
    // Update existing object
    dataArray[index] = { ...dataArray[index], ...newItem };
  } else {
    // Add new object
    dataArray.push(newItem);
  }

  // Convert back to string and return
  return JSON.stringify(dataArray);
};

// Function to get an object by name
const getObjectByName = (str: string, name: string): Annotation | null => {
  // Parse the string into an array
  const dataArray: Annotation[] = str ? JSON.parse(str) : [];

  // Find the object with the given name
  return dataArray.find((item) => item.fieldName === name) || null;
};

// Function to set field values by mapping the field name
const updateFieldValueByFieldName = (
  annotationObj: string,
  extractedData: IFieldValueSchema[],
): string => {
  // Parse the annotation string into an array
  const fieldsArray: Annotation[] = annotationObj
    ? JSON.parse(annotationObj)
    : [];

  extractedData.forEach((item) => {
    // Find the extracted field with the same field name
    const dataFiled = fieldsArray.find(
      (field) => field.fieldName === item.fieldName,
    );

    // If the field is found, update the value
    if (dataFiled) {
      dataFiled.value = item.fieldValue;
    } else {
      // If the field is not found, add a new field
      fieldsArray.push({
        fieldId: "",
        pageNumber: 0,
        fieldName: item.fieldName,
        value: item.fieldValue,
        position: {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        },
        imgPath: "",
      });
    }
  });

  // Convert back to string and return
  return JSON.stringify(fieldsArray);
};

const removeFieldById = (annotationObj: string, fieldId: string): string => {
  // Parse the annotation string into an array
  const fieldsArray: Annotation[] = annotationObj
    ? JSON.parse(annotationObj)
    : [];

  // Filter out the field with the given fieldId
  const updatedFieldsArray = fieldsArray.filter(
    (field) => field.fieldId !== fieldId,
  );

  // Convert back to string and return
  return JSON.stringify(updatedFieldsArray);
};

export {
  addUpdateInString,
  getObjectByName,
  getTailwindColor,
  updateFieldValueByFieldName,
  removeFieldById,
};
