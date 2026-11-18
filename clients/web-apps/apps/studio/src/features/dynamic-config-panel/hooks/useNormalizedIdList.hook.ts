import { useEffect } from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

const SILENT = { shouldDirty: false, shouldTouch: false, shouldValidate: false } as const;

/** Rewrites a saved comma-separated id string, or a missing value, as a string array without dirtying the form. */
export const useNormalizedIdList = (name: FieldPath<FieldValues>) => {
  const { getValues, setValue } = useFormContext();

  useEffect(() => {
    const currentValue = getValues(name);
    if (Array.isArray(currentValue)) return;

    const normalized =
      typeof currentValue === "string"
        ? currentValue
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
        : [];

    setValue(name, normalized, SILENT);
  }, [getValues, name, setValue]);
};
