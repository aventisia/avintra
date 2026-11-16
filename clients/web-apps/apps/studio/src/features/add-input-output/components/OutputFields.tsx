import { cn } from "@avplatform/ui/lib";
import { useId } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";

import { FormField } from "@/components/card-dialog/FormField";
import { getFieldInputClassName } from "@/components/card-dialog/field-input.util";

import { InputsOutputsFieldsFormType } from "../constants/inputs-outputs-zod-schema";
import { FieldCard } from "./FieldCard";

type OutputFieldsProps = {
  form: UseFormReturn<InputsOutputsFieldsFormType>;
  index: number;
  onRemove: () => void;
};

const OutputFields = ({ form, index, onRemove }: OutputFieldsProps) => {
  const fieldId = useId();
  const nameId = `${fieldId}-name`;
  const descriptionId = `${fieldId}-description`;
  const name = useWatch({ control: form.control, name: `outputs.${index}.name` });
  const errors = form.formState.errors.outputs?.[index];

  return (
    <FieldCard heading={`Output ${index + 1}`} name={name} onRemove={onRemove}>
      <FormField htmlFor={nameId} label="Output variable" error={errors?.name?.message}>
        <input
          id={nameId}
          autoComplete="off"
          spellCheck={false}
          placeholder="summary"
          aria-invalid={Boolean(errors?.name)}
          aria-describedby={errors?.name ? `${nameId}-error` : undefined}
          {...form.register(`outputs.${index}.name`)}
          className={cn(getFieldInputClassName(Boolean(errors?.name)), "h-9 font-mono")}
        />
      </FormField>

      <FormField htmlFor={descriptionId} label="Description" isOptional>
        <input
          id={descriptionId}
          autoComplete="off"
          placeholder="What this output holds"
          {...form.register(`outputs.${index}.description`)}
          className={cn(getFieldInputClassName(false), "h-9")}
        />
      </FormField>
    </FieldCard>
  );
};

export default OutputFields;
