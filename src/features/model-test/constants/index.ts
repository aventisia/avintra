import { VisibilityState } from "@tanstack/react-table";
import { ExtractedDataDto } from "../dtos/ extracted-data-dto";

// Function to generate initial visibility state for the columns
const generateVisibility = (
  data: ExtractedDataDto[] | undefined,
): VisibilityState => {
  if (!data) return {};
  const dynamicFields = data.flatMap((item) => Object.keys(item.dynamicFields));
  const uniqueFields = Array.from(new Set(dynamicFields));

  // Set visibility for docName and accuracy columns to true, and for dynamic fields
  const visibilityState: VisibilityState = {
    docName: true,
    accuracy: true,
    // Use reduce to dynamically add visibility for dynamic fields
    ...uniqueFields.reduce<Record<string, boolean>>((acc, field) => {
      acc[field] = true; // Set dynamic fields visibility to true by default
      return acc;
    }, {}),
  };

  return visibilityState;
};

// Function to refactor the API data for table
const refactorData = (data: ExtractedDataDto[] | undefined) => {
  if (!data) return [];
  return data.map((item) => ({
    docId: item.docId, // Doc id for link
    docName: item.docName, // Static field
    accuracy: item.accuracy, // Static field
    ...item.dynamicFields, // Spread dynamic fields into the row
  }));
};

export { generateVisibility, refactorData };
