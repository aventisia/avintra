import { MultiSelectField } from "@avplatform/ui/form";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { getSkillSelectOptions } from "../../apis/skill-registry-apis";
import { GroupedFieldsWrapper } from "./GroupedFieldsWrapper";

interface SkillsConfigFieldProps {
  /** The name of the form field. */
  name: string;
}

const SkillsConfigField = ({ name }: SkillsConfigFieldProps) => {
  const skillsFieldName = `${name}.skills` as FieldPath<FieldValues>;

  const { setValue, getValues } = useFormContext();

  const { data: skillOptionsData } = useQuery({
    queryKey: ["skill-options"],
    queryFn: getSkillSelectOptions,
    select: (response) => response?.data ?? [],
  });

  const skillSelectOptions = (skillOptionsData ?? []).map((option) => ({
    label: option.label,
    value: option.value,
    description: option.description,
  }));

  useEffect(() => {
    const currentValue = getValues(skillsFieldName);

    if (Array.isArray(currentValue)) {
      return;
    }

    if (typeof currentValue === "string") {
      const normalizedValue = currentValue
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      setValue(skillsFieldName, normalizedValue, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      return;
    }

    setValue(skillsFieldName, [], {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [getValues, skillsFieldName, setValue]);

  return (
    <GroupedFieldsWrapper groupName="Skills">
      <MultiSelectField
        size="sm"
        name={skillsFieldName}
        label="Skill(s)"
        placeholder="Select skill(s)"
        selectOptions={skillSelectOptions}
      />
    </GroupedFieldsWrapper>
  );
};

SkillsConfigField.displayName = "SkillsConfigField";

export { SkillsConfigField, type SkillsConfigFieldProps };
