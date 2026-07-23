import { CrudActionType, ISelectOption } from "@avplatform/ui/types";

export function when<T>(
  value: T,
  cases: { [key: string]: () => unknown },
  defaultValue: () => unknown,
): unknown {
  const key = String(value);
  return cases[key] ? cases[key]() : defaultValue();
}

/**
 * get search options from the enum or static array for async select field
 *
 * @param {ISelectOption[]} selectOptions
 * @param {string} [query]
 * @return {Promise<ISelectOption[]>}
 */
export const getSearchOptionsForAsyncSelect = async (
  selectOptions: ISelectOption[],
  query?: string,
): Promise<ISelectOption[]> => {
  await new Promise((resolve) => setTimeout(resolve, 3));
  if (query) {
    const lowercaseQuery = query.toLowerCase();
    return selectOptions
      .filter((option) => option.label.toLowerCase().includes(lowercaseQuery))
      .slice(0, 10); // Return only first 10 matches
  }

  return selectOptions.slice(0, 10);
};

export function areStringsEqualCaseInsensitive(str1: string, str2: string): boolean {
  return str1.localeCompare(str2, undefined, { sensitivity: "case" }) === 0;
}

export /**
 * converter to use in define form hook to set crud action in zod object to manipulate validation.
 *
 * @param {CrudActionType} action
 * @return {("create" | "read" | "update" | undefined)}
 */
const CrudActionTypeConverter = (
  action: CrudActionType,
): "create" | "read" | "update" | undefined => {
  switch (action) {
    case "create":
      return "create";
    case "read":
      return "read";
    case "update":
      return "update";
    default:
      return undefined;
  }
};
