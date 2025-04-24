import clsx, { ClassValue } from "clsx";
import { KeyboardEvent, SyntheticEvent } from "react";
import { twMerge } from "tailwind-merge";

import { ISelectOption } from "@/react-toolkit/types/select-option";

export function when<T>(
  value: T,
  cases: { [key: string]: () => unknown },
  defaultValue: () => unknown,
): unknown {
  const key = String(value);
  return cases[key] ? cases[key]() : defaultValue();
}
export const clsxMerge = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const joinClassNames = (...classNames: string[]) => classNames.join(" ");

export const handleKeyboardEvent =
  <Type = Element>(
    key: KeyboardEvent["key"] | Array<KeyboardEvent["key"]>,
    callback: (event: SyntheticEvent<Type>) => void,
  ) =>
  (event: KeyboardEvent<Type>) => {
    const keys = Array.isArray(key) ? key : [key];

    if (keys.includes(event.key)) {
      callback(event);
    }
  };

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
