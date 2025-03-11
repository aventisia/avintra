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

export const getEnumValueByKey = <T extends { [key: string]: string }>(
  enumObj: T,
  key: string,
): string => {
  return enumObj[key];
}
