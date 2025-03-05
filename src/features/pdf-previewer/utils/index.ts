import { Annotation } from "../components/PdfPreviewer";
import { tailwindColors } from "../constants";

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
export { getTailwindColor, addUpdateInString, getObjectByName };
