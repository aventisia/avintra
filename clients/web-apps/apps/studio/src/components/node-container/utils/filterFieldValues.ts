// Function to filter field values based on the type (input or output)
function filterFieldValues(
  newFieldValues: Record<string, string | number | boolean>,
  type: "input" | "output", // Parameter to specify whether it's input or output
) {
  if (type === "input") {
    // For input, skip keys that start with 'o_'
    return Object.keys(newFieldValues)
      .filter((key) => !key.startsWith("o_")) // Skip keys that start with "o_"
      .map((key) => ({
        key,
        value: newFieldValues[key],
      }));
  } else if (type === "output") {
    // For output, only include keys that start with 'o_'
    return Object.keys(newFieldValues)
      .filter((key) => key.startsWith("o_")) // Only include keys that start with "o_"
      .map((key) => ({
        key,
        value: newFieldValues[key],
      }));
  }
  return [];
}

export default filterFieldValues;
