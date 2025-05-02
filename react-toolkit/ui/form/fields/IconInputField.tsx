import { Input } from "@aventisia/ui";
import { FormControl } from "@aventisia/ui/form";
import { FormField } from "@aventisia/ui/form";
import { FormItem } from "@aventisia/ui/form";
import { FormMessage } from "@aventisia/ui/form";
import { BaseFieldProps } from "@aventisia/ui/form";
import { FormLabelExt } from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { LucideProps } from "lucide-react";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import Lucide, { type LucidIconName } from "../../Lucide";

interface IconInputFieldProps
  extends React.ComponentPropsWithoutRef<typeof Input>,
    BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;
  iconProps: LucideProps & {
    icon: LucidIconName;
    position: "end" | "start";
    onClick?: () => void;
  };
}

/**
 * A custom input form field component with label (if provided)
 */
const IconInputField = ({
  name,
  label,
  fieldSize = "base",
  isRequired,
  description,
  className,
  disabled,
  type,
  nonErrorMessage,
  iconProps,
  ...props
}: IconInputFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();

  // Render the InputField component
  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem size={fieldSize}>
          {label && (
            <FormLabelExt
              size={fieldSize}
              {...{ label, disabled, isRequired, description }}
            />
          )}
          <FormControl>
            <div className="relative">
              <div
                className={cn(
                  "pointer-events-auto absolute inset-y-0",
                  iconProps.position == "start"
                    ? "start-0 ps-3.5"
                    : "end-0 pe-3.5",
                  "top-0 flex items-center",
                )}
              >
                <Lucide
                  className={iconProps.className}
                  icon={iconProps.icon}
                  onClick={iconProps.onClick}
                />
              </div>
              <Input
                fieldSize={fieldSize}
                type={type}
                className={cn(
                  className,
                  iconProps.position == "start" ? "ps-10" : "pe-10",
                )}
                disabled={disabled}
                {...props}
                {...field}
                ref={field.ref}
              />
            </div>
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
      )}
    />
  );
};

IconInputField.displayName = "InputField";

export { IconInputField, type IconInputFieldProps };
