import * as React from "react";
import { twMerge } from "tailwind-merge";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";
import { FormLabelExt } from "@/react-toolkit/ui/form/non-field/FormLabelExt";
import { BaseFieldProps } from "@/react-toolkit/ui/form/fields/base-field-props";
import { Input } from "@/react-toolkit/ui/input";

interface CheckboxInputFeildProps
  extends React.ComponentPropsWithoutRef<typeof Input>,
    BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;
  type: "checkbox" | "radio";
}

export type CheckboxFeildProps = React.PropsWithChildren &
  React.ComponentPropsWithoutRef<"div">;

function CheckboxFeildDiv(props: CheckboxFeildProps) {
  return (
    <div {...props} className={twMerge(["flex items-center", props.className])}>
      {props.children}
    </div>
  );
}

export type LabelProps = React.PropsWithChildren &
  React.ComponentPropsWithoutRef<"label">;

CheckboxFeildDiv.Label = (props: LabelProps) => {
  return (
    <label
      {...props}
      className={twMerge(["ml-2 cursor-pointer", props.className])}
    >
      {props.children}
    </label>
  );
};

const CheckboxInputFeild = ({
  name,
  label,
  fieldSize = "base",
  isRequired,
  description,
  className,
  disabled,
  type,
  nonErrorMessage,
  ...props
}: CheckboxInputFeildProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the InputField component
  console.log(control.getFieldState("gender"));

  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => {
        return (
          <FormItem size={fieldSize}>
            {label && (
              <FormLabelExt
                size={fieldSize}
                {...{ label, disabled, isRequired, description }}
              />
            )}
            <FormControl>
              <input
                type={type}
                name={name}
                className={twMerge([
                  // Default
                  "outline-hidden border-none transition-all duration-100 ease-in-out",

                  // Input type radio
                  type == "radio" &&
                    "dark:bg-darkmode-700 cursor-pointer border-slate-300/80 shadow-sm focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:ring-offset-0 dark:focus:ring-slate-700 dark:focus:ring-opacity-50",

                  // Input type checkbox
                  type == "checkbox" &&
                    "dark:bg-darkmode-700 cursor-pointer rounded border-slate-300/80 shadow-sm focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:ring-offset-0 dark:focus:ring-slate-700 dark:focus:ring-opacity-50",

                  // On checked
                  "[&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-0 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:outline-none",
                  "[&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&[type='checkbox']]:checked:bg-primary",

                  // On checked and not disabled
                  "[&:disabled:not(:checked)]:dark:bg-darkmode-700/50 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:not(:checked)]:bg-slate-100",

                  // On checked and disabled
                  "[&:disabled:checked]:dark:bg-darkmode-700/50 [&:disabled:checked]:cursor-not-allowed [&:disabled:checked]:opacity-70",
                  className,
                ])}
                ref={field.ref}
                {...props}
              />
            </FormControl>

            {nonErrorMessage ? (
              <FormMessage
                customMessageType={nonErrorMessage.type}
                size={fieldSize}
              >
                {nonErrorMessage.message}
              </FormMessage>
            ) : (
              <FormMessage size={fieldSize} />
            )}
          </FormItem>
        );
      }}
    />
  );
};

CheckboxFeildDiv.CheckboxInputFeild = CheckboxInputFeild;
export default CheckboxFeildDiv;
