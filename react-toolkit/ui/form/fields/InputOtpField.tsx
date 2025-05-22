import { cn } from "@aventisia/ui/lib";
import { BaseFieldProps } from "@aventisia/ui/form";
import { FormControl } from "@aventisia/ui/form";
import { FormField } from "@aventisia/ui/form";
import { FormItem } from "@aventisia/ui/form";
import { FormMessage } from "@aventisia/ui/form";
import { FormLabelExt } from "@aventisia/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@aventisia/ui/input-otp";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

type InputOtpFieldProps = React.ComponentPropsWithoutRef<typeof InputOTP> &
  BaseFieldProps & {
    /** The name of the form field. */
    name: FieldPath<FieldValues>;
  };

/**
 * A custom input OTP form field component with label (if provided)
 */
const InputOtpField = ({
  name,
  label,
  isRequired,
  description,
  className,
  disabled,
  ...props
}: InputOtpFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the InputOtpField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabelExt {...{ label, disabled, isRequired, description }} />
          )}
          <FormControl>
            <InputOTP
              className={cn(className)}
              containerClassName="flex justify-between"
              disabled={disabled}
              {...props}
              {...field}
              ref={field.ref}
              render={undefined}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
              </InputOTPGroup>
              <InputOTPGroup>
                <InputOTPSlot index={1} />
              </InputOTPGroup>
              <InputOTPGroup>
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPGroup>
                <InputOTPSlot index={3} />
              </InputOTPGroup>
              <InputOTPGroup>
                <InputOTPSlot index={4} />
              </InputOTPGroup>
              <InputOTPGroup>
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

InputOtpField.displayName = "InputOtpField";

export { InputOtpField, type InputOtpFieldProps };
