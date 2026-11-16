import { Switch } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { useId } from "react";
import { Controller, type UseFormReturn, useWatch } from "react-hook-form";

import { FormField } from "@/components/card-dialog/FormField";
import { getFieldInputClassName } from "@/components/card-dialog/field-input.util";

import { InputsOutputsFieldsFormType } from "../constants/inputs-outputs-zod-schema";
import { FieldCard } from "./FieldCard";
import { InputTypePicker } from "./InputTypePicker";

type InputFieldsProps = {
  form: UseFormReturn<InputsOutputsFieldsFormType>;
  index: number;
  onRemove: () => void;
};

const InputFields = ({ form, index, onRemove }: InputFieldsProps) => {
  const fieldId = useId();
  const { control, register } = form;
  const [name, type] = useWatch({
    control,
    name: [`inputs.${index}.name`, `inputs.${index}.type`],
  });
  const errors = form.formState.errors.inputs?.[index];
  const ids = {
    name: `${fieldId}-name`,
    label: `${fieldId}-label`,
    defaultValue: `${fieldId}-default`,
    selectOptions: `${fieldId}-options`,
    description: `${fieldId}-description`,
    required: `${fieldId}-required`,
  };

  return (
    <FieldCard heading={`Input ${index + 1}`} name={name} onRemove={onRemove}>
      <FormField htmlFor={ids.name} label="Name" error={errors?.name?.message}>
        <input
          id={ids.name}
          {...(index === 0 ? { "data-autofocus": "" } : {})}
          autoComplete="off"
          spellCheck={false}
          placeholder="customerEmail"
          aria-invalid={Boolean(errors?.name)}
          aria-describedby={errors?.name ? `${ids.name}-error` : undefined}
          {...register(`inputs.${index}.name`)}
          className={cn(getFieldInputClassName(Boolean(errors?.name)), "h-9 font-mono")}
        />
      </FormField>

      <FormField htmlFor={ids.label} label="Label" isOptional>
        <input
          id={ids.label}
          autoComplete="off"
          placeholder="Customer email"
          {...register(`inputs.${index}.label`)}
          className={cn(getFieldInputClassName(false), "h-9")}
        />
      </FormField>

      <div className="xs:col-span-2">
        <InputTypePicker selectedValue={type} registration={register(`inputs.${index}.type`)} />
      </div>

      {type === "select" && (
        <div className="xs:col-span-2">
          <FormField
            htmlFor={ids.selectOptions}
            label="Options"
            hint={
              <p className="pt-1.5 text-[12px] text-muted-foreground">
                Separate options with a semicolon
              </p>
            }
          >
            <input
              id={ids.selectOptions}
              autoComplete="off"
              placeholder="Red; Green; Blue"
              {...register(`inputs.${index}.selectOptions`)}
              className={cn(getFieldInputClassName(false), "h-9")}
            />
          </FormField>
        </div>
      )}

      {type === "switch" ? (
        <div className="flex items-center justify-between gap-3 self-end rounded-md bg-sunken/80 px-3.5 py-2 ring-1 ring-line">
          <label htmlFor={ids.defaultValue} className="text-[12.5px] font-semibold text-ink-2">
            On by default
          </label>
          <Controller
            control={control}
            name={`inputs.${index}.defaultValue`}
            render={({ field }) => (
              <Switch
                id={ids.defaultValue}
                size="sm"
                checked={field.value === "true"}
                onCheckedChange={(checked) => field.onChange(String(checked))}
              />
            )}
          />
        </div>
      ) : (
        <FormField htmlFor={ids.defaultValue} label="Default value" isOptional>
          <input
            id={ids.defaultValue}
            type={type === "password" ? "password" : "text"}
            autoComplete="off"
            {...register(`inputs.${index}.defaultValue`)}
            className={cn(getFieldInputClassName(false), "h-9")}
          />
        </FormField>
      )}

      <div className="flex items-center justify-between gap-3 self-end rounded-md bg-sunken/80 px-3.5 py-2 ring-1 ring-line">
        <label htmlFor={ids.required} className="text-[12.5px] font-semibold text-ink-2">
          Required
        </label>
        <Controller
          control={control}
          name={`inputs.${index}.required`}
          render={({ field }) => (
            <Switch
              id={ids.required}
              size="sm"
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="xs:col-span-2">
        <FormField htmlFor={ids.description} label="Description" isOptional>
          <input
            id={ids.description}
            autoComplete="off"
            placeholder="Helper text shown under the field"
            {...register(`inputs.${index}.description`)}
            className={cn(getFieldInputClassName(false), "h-9")}
          />
        </FormField>
      </div>
    </FieldCard>
  );
};

export default InputFields;
