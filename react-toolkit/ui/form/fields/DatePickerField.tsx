import { cn } from "@/react-toolkit/lib/utils";
import { FormFieldSizeType } from "@/react-toolkit/types/literal-types";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { Calendar } from "@/react-toolkit/ui/calendar";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";
import { BaseFieldProps } from "@/react-toolkit/ui/form/fields/base-field-props";
import { FormLabelExt } from "@/react-toolkit/ui/form/non-field/FormLabelExt";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/react-toolkit/ui/popover";

import { CalendarIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

interface DatePickerFieldProps
  extends React.ComponentPropsWithoutRef<typeof PopoverTrigger>,
    BaseFieldProps {
  size?: FormFieldSizeType;

  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The placeholder for the select field. */
  placeholder?: string;
}

/**
 * A custom date picker form field component with label (if provided)
 */
const DatePickerField = ({
  name,
  label,
  size = "base",
  isRequired,
  description,
  disabled,
  placeholder,
  ...props
}: DatePickerFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the DatePickerField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem {...{ size }}>
          {label && (
            <FormLabelExt
              {...{ size, label, disabled, isRequired, description }}
            />
          )}
          <FormControl>
            <Popover>
              <PopoverTrigger
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full pl-3 pr-[0.68rem] text-left font-normal",
                  !field.value && "text-muted-foreground",
                  size === "xs" && "h-7 pl-[0.45rem] pr-1 text-2xs",
                  size === "sm" && "h-8 pl-[0.55rem] pr-1.5 text-xs",
                  size === "base" && "h-10 pl-3 pr-2.5 text-sm",
                )}
                disabled={disabled}
                {...field}
                {...props}
                ref={field.ref}
              >
                {field.value ? (
                  format(field.value, "PPP")
                ) : (
                  <span>{placeholder}</span>
                )}
                <CalendarIcon
                  className={cn(
                    "ml-auto opacity-50",
                    size === "xs" && "h-3 w-3",
                    size === "sm" && "h-3.5 w-3.5",
                    size === "base" && "h-4 w-4",
                  )}
                />
              </PopoverTrigger>
              <PopoverContent align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date("1900-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage {...{ size }} />
        </FormItem>
      )}
    />
  );
};

DatePickerField.displayName = "DatePickerField";

export { DatePickerField, type DatePickerFieldProps };
