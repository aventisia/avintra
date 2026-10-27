import { BaseFieldProps, FormControl, FormField, FormItem, FormMessage } from "@avplatform/ui/form";
import { RadioGroup, RadioGroupItem } from "@avplatform/ui/radio-group";
import type { FormFieldSizeType } from "@avplatform/ui/types";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { twMerge } from "tailwind-merge";

interface CheckboxInputFeildProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroup>, BaseFieldProps {
  size?: FormFieldSizeType;

  /** The name of the form field. */
  name: FieldPath<FieldValues>;
  type: "checkbox" | "radio";
}

export type CheckboxFeildProps = React.PropsWithChildren & React.ComponentPropsWithoutRef<"div">;

const CheckboxFeildDiv = (props: CheckboxFeildProps) => {
  return (
    <div {...props} className={twMerge(["", props.className])}>
      {props.children}
    </div>
  );
};

export type LabelProps = React.PropsWithChildren & React.ComponentPropsWithoutRef<"label">;

CheckboxFeildDiv.Label = (props: LabelProps) => {
  return (
    <label {...props} className={twMerge(["ml-2 cursor-pointer", props.className])}>
      {props.children}
    </label>
  );
};

const CheckboxFormField = ({
  name,
  size = "base",
  disabled,
  nonErrorMessage,
  ...props
}: CheckboxInputFeildProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the InputField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => {
        return (
          <FormItem size={size}>
            <FormControl>
              <RadioGroup
                {...props}
                {...field}
                ref={field.ref}
                disabled={disabled}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                {props.children}
              </RadioGroup>
            </FormControl>

            {nonErrorMessage ? (
              <FormMessage customMessageType={nonErrorMessage.type} size={size}>
                {nonErrorMessage.message}
              </FormMessage>
            ) : (
              <FormMessage size={size} />
            )}
          </FormItem>
        );
      }}
    />
  );
};

const CheckboxInputFeild = (
  props: React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
) => {
  return <RadioGroupItem {...props} />;
};

const CheckboxInputFeildWrapper = (props?: CheckboxFeildProps) => {
  return (
    <div className="w-full rounded-md border border-input bg-surface px-3 py-2 shadow-sm first:rounded-b-none last:-mt-px last:rounded-t-none focus:z-10 first:md:rounded-r-none first:md:rounded-bl-md last:md:-ml-px last:md:mt-0 last:md:rounded-l-none last:md:rounded-tr-md [&:not(:first-child):not(:last-child)]:-mt-px [&:not(:first-child):not(:last-child)]:rounded-none [&:not(:first-child):not(:last-child)]:md:-ml-px [&:not(:first-child):not(:last-child)]:md:mt-0">
      <div className="flex items-center">{props?.children}</div>
    </div>
  );
};

CheckboxFeildDiv.CheckboxInputFeild = CheckboxInputFeild;
CheckboxFeildDiv.CheckboxInputFeildWrapper = CheckboxInputFeildWrapper;
CheckboxFeildDiv.CheckboxFormField = CheckboxFormField;
export default CheckboxFeildDiv;
