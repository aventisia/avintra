import { Separator } from "@aventisia/ui";
import { BaseFieldProps, SwitchField } from "@aventisia/ui/form";
import { FormFieldSizeType } from "@aventisia/ui/types";
import { useMemo } from "react";
import { FieldPath, FieldValues } from "react-hook-form";

import { GroupedFieldsWrapper } from "./GroupedFieldsWrapper";
import { StringArrayField } from "./StringArrayField";

interface SuggestionsFieldProps extends BaseFieldProps {
  name: FieldPath<FieldValues>;
  disabled?: boolean;
  label?: string;
  isRequired?: boolean;
  description?: string;
  size?: FormFieldSizeType;
}

export function SuggestionsField({
  name,
  disabled,
  isRequired,
  size,
}: SuggestionsFieldProps) {
  const fieldNames = useMemo(
    () =>
      ({
        defaultActions: `${name}.DefaultActions`,
        enableDynamicActions: `${name}.EnableDynamicActions`,
      }) as const,
    [name],
  );

  return (
    <GroupedFieldsWrapper groupName="Configure Default Actions">
      <StringArrayField
        name={fieldNames.defaultActions}
        placeholder="Add Action"
        disabled={disabled}
        isRequired={isRequired}
        size={size}
      />

      <Separator />

      <SwitchField
        name={fieldNames.enableDynamicActions}
        label="Enable Dynamic Actions"
        description="Enable dynamically generated suggestions during conversations."
        disabled={disabled}
        size={size}
      />
    </GroupedFieldsWrapper>
  );
}
