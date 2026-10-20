import { twMerge } from "tailwind-merge";

type ClassValue = string | number | null | undefined | false | ClassValue[];

const flatten = (values: ClassValue[]): string[] =>
  values.flatMap((value) =>
    Array.isArray(value) ? flatten(value) : value || value === 0 ? [String(value)] : [],
  );

/** Joins class names and resolves conflicting Tailwind utilities, last one wins. */
export const cn = (...values: ClassValue[]) => twMerge(flatten(values).join(" "));
