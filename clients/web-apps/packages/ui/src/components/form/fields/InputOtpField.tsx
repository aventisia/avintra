import * as React from "react";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabelExt, FormMessage } from "@/ui/components/form";
import type { BaseFieldProps } from "@/ui/components/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/ui/components/input-otp";
import { cn } from "@/ui/lib";

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
          {label && <FormLabelExt {...{ label, disabled, isRequired, description }} />}
          <FormControl>
            <InputOTP
              className={cn(className)}
              containerClassName="flex justify-between"
              disabled={disabled}
              {...field}
              ref={field.ref}
              {...props}
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
