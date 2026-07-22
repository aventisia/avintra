/**
 * Converts an enum object into an array of objects with `label` and `value` properties.
 *
 * This function is useful for transforming TypeScript enums into a format suitable
 * for use in UI components like dropdowns or select inputs.
 *
 * @typeParam T - A generic type extending an object with string keys and string values.
 * @param enumObj - The enum object to be converted.
 * @returns An array of objects where each object has:
 * - `label`: The value of the enum.
 * - `value`: The key of the enum.
 *
 * @example
 * enum Colors {
 *   Red = "Red",
 *   Green = "Green",
 *   Blue = "Blue"
 * }
 *
 * const colorArray = enumToArray(Colors);
 * // Result:
 * // [
 * //   { label: "Red", value: "Red" },
 * //   { label: "Green", value: "Green" },
 * //   { label: "Blue", value: "Blue" }
 * // ]
 */
export const enumToArray = <T extends { [key: string]: string }>(
  enumObj: T,
): { label: string; value: string }[] => {
  return Object.keys(enumObj)
    .filter((key) => isNaN(Number(key))) // Filter out numeric keys
    .map((key) => ({
      label: enumObj[key],
      value: key,
    }));
};

/**
 * Retrieves the value of an enum by its key.
 *
 * @template T - A generic type extending an object where keys are strings and values are strings.
 * @param enumObj - The enum object to retrieve the value from.
 * @param key - The key whose corresponding value needs to be retrieved.
 * @returns The value associated with the specified key in the enum object.
 *
 * @example
 * enum Colors {
 *   RED = "red",
 *   BLUE = "blue",
 *   GREEN = "green"
 * }
 *
 * const colorValue = getEnumValueByKey(Colors, "RED");
 * console.log(colorValue); // Output: "red"
 */
export const getEnumValueByKey = <T extends { [key: string]: string }>(
  enumObj: T,
  key: string,
): string => {
  return enumObj[key];
};
