import { Separator } from "@avplatform/ui";
import {
  AutosizeTextareaField,
  BaseFieldProps,
  SwitchField,
} from "@avplatform/ui/form";
import { FormFieldSizeType } from "@avplatform/ui/types";
import { useMemo } from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

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
  // Connect to the parent form context
  const { watch } = useFormContext();

  const fieldNames = useMemo(
    () =>
      ({
        defaultActions: `${name}.defaultActions`,
        enableDynamicActions: `${name}.enableDynamicActions`,
        followUpMessagePrompt: `${name}.followUpMessagePrompt`,
      }) as const,
    [name],
  );
  const showPromptField = watch(fieldNames.enableDynamicActions);
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
        label="Generate Follow-up Messages"
        description="Enable dynamically generated follow-up messages during conversations."
        disabled={disabled}
        size={size}
      />
      {showPromptField && (
        <AutosizeTextareaField
          minHeight={0}
          name={fieldNames.followUpMessagePrompt}
          label="Follow-up Messages Prompt"
          disabled={disabled}
          size={size}
        />
      )}
    </GroupedFieldsWrapper>
  );
}
