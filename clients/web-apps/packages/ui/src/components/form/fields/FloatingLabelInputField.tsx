import * as React from "react";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";

import { Input } from "@/ui/components";
import { FormControl, FormField, FormItem, FormMessage } from "@/ui/components/form";
import { cn } from "@/ui/lib";
import { type CustomFormMessage } from "@/ui/types";

interface FloatingLabelInputFieldProps extends React.ComponentPropsWithoutRef<typeof Input> {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The label of the form field. */
  label: string;

  /** To override the style of the label. */
  labelClassName?: string;

  /** Prop to add custom message to the form field which are not errors. */
  nonErrorMessage?: CustomFormMessage | null;
}

/**
 * A custom floating label input form field component
 */
const FloatingLabelInputField = ({
  name,
  label,
  labelClassName,
  fieldSize = "base",
  className,
  disabled,
  type,
  nonErrorMessage,
  ...props
}: FloatingLabelInputFieldProps) => {
  const id = React.useId();
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the FloatingLabelInputField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem size={fieldSize}>
          <FormControl>
            <div className="group relative">
              <label
                htmlFor={id}
                className={cn(
                  "origin-start absolute top-1/2 z-10 block -translate-y-1/2 cursor-text px-2 text-sm font-normal text-muted-foreground transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-2xs group-focus-within:font-medium group-focus-within:text-ink has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-2xs has-[+input:not(:placeholder-shown)]:font-medium has-[+input:not(:placeholder-shown)]:text-ink",
                  labelClassName,
                )}
              >
                <span className="inline-flex rounded-sm bg-surface px-[0.32rem]">{label}</span>
              </label>
              <Input
                id={id}
                fieldSize={fieldSize}
                type={type}
                className={cn(className)}
                disabled={disabled}
                placeholder=""
                {...field}
                ref={field.ref}
                {...props}
              />
            </div>
          </FormControl>

          {nonErrorMessage ? (
            <FormMessage customMessageType={nonErrorMessage.type} size={fieldSize}>
              {nonErrorMessage.message}
            </FormMessage>
          ) : (
            <FormMessage size={fieldSize} />
          )}
        </FormItem>
      )}
    />
  );
};

FloatingLabelInputField.displayName = "FloatingLabelInputField";

export { FloatingLabelInputField, type FloatingLabelInputFieldProps };
