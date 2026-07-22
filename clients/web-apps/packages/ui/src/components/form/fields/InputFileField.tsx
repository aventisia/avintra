import * as React from "react";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";

import { Input } from "@/ui/components";
import { FormControl, FormField, FormItem, FormLabelExt, FormMessage } from "@/ui/components/form";
import type { BaseFieldProps } from "@/ui/components/form";

interface InputFieldProps extends React.ComponentPropsWithoutRef<typeof Input>, BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /**
   * extensions like .json .ts .jpg
   * @type {string[]}
   * @memberof InputFieldProps
   */
  fileTypes: string[];

  /**
   * when multiple is true then the value of the input is @type {File | null} otherwise @type {FileList | null}
   *
   * @type {boolean}
   * @memberof InputFieldProps
   */
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

    setValue(name, multiple ? event.target.files : event.target.files?.item(0), {
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
            <FormLabelExt size={fieldSize} {...{ label, disabled, isRequired, description }} />
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
