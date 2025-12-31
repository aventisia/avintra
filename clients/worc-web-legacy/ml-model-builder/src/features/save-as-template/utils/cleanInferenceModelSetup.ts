/* eslint-disable @typescript-eslint/no-explicit-any */
import { InferenceModelSetupDTO } from "@/features/inferencing-model/dtos/inference-model-setup-dto";

export function cleanInferenceModelSetup(data: InferenceModelSetupDTO): string {
  // Recursive function to clean data (handle nested objects)
  const cleanData = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj
        .map((item) => cleanData(item)) // Recursively clean array items
        .filter((item) => item !== null && item !== undefined); // Remove null/undefined items
    }

    if (obj && typeof obj === "object") {
      const cleanedObj: any = {};
      for (const key in obj) {
        // Skip 'id' and 'secret' properties, and properties with null values
        if (
          obj[key] === null ||
          obj[key] === undefined ||
          key.toLowerCase().includes("id") || // Remove keys with 'id' (including nested 'id')
          key.toLowerCase().includes("secret") || // Remove keys with 'secret'
          key.toLowerCase() === "createdby" || // Remove 'createdBy'
          key.toLowerCase() === "createdbyusername" || // Remove 'createdByUsername'
          key.toLowerCase() === "createdon" // Remove 'createdOn'
        ) {
          continue;
        }

        // Recursively clean the value
        cleanedObj[key] = cleanData(obj[key]);
      }
      return cleanedObj;
    }

    // Return non-object values as-is
    return obj;
  };

  // Start cleaning from the top level of the data
  const cleanedData = cleanData(data);

  // Convert the cleaned data to a JSON string
  return JSON.stringify(cleanedData, null, 2); // Pretty print for readability
}
