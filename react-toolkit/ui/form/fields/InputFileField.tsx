import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { BaseFieldProps } from "@/react-toolkit/ui/form/fields/base-field-props";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";
import { FormLabelExt } from "@/react-toolkit/ui/form/non-field/FormLabelExt";
import { Input } from "@/react-toolkit/ui/input";
import * as React from "react";

interface InputFieldProps
  extends React.ComponentPropsWithoutRef<typeof Input>,
    BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /**
   * extensions like .json .ts .jpg
   * @type {string[]}
   * @memberof InputFieldProps
   */
  fileTypes: string[];

  multiple: boolean;
  getFiles?: (files: FileList | null) => void;
}

/**
 * A custom input form field component with label (if provided)
 */

export const InputFileField = ({
  name,
  label,
  fieldSize = "base",
  isRequired,
  description,
  disabled,
  fileTypes,
  multiple = false,
  nonErrorMessage,
  getFiles,
  ...props
}: InputFieldProps) => {
  // Get the form context
  const { control, setValue } = useFormContext<FieldValues>();

  const [files, setFiles] = React.useState<FileList | null>();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(event.target.files);
    if (getFiles) getFiles(event.target.files);

    setValue(name, event.target.files, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const Id = window.crypto.randomUUID();

  // Render the InputFileField component
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
            <div className="relative w-full">
              <label
                htmlFor={Id}
                className="block h-10 w-full cursor-pointer rounded-md border bg-transparent px-4 py-2 text-left text-sm font-normal text-slate-700"
              >
                <span>
                  <p>{files?.item(0)?.name ?? "Select File"}</p>
                  <p className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-primary-500 hover:underline focus:outline-none">
                    Browse File
                  </p>
                </span>{" "}
              </label>

              <input
                id={Id}
                className="hidden"
                name={name}
                type="file"
                disabled={disabled}
                accept={fileTypes?.join(",")}
                multiple={multiple}
                ref={field.ref}
                onChange={handleInputChange}
                {...props}
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
