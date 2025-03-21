import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { BaseFieldProps } from "@/react-toolkit/ui/form/fields/base-field-props";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";
import { FormLabelExt } from "@/react-toolkit/ui/form/non-field/FormLabelExt";
import { Input } from "@/react-toolkit/ui/input";

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

  getSelectedFiles: (files: FileList | null) => void;
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
  nonErrorMessage,
  getSelectedFiles,
  ...props
}: InputFieldProps) => {
  // Get the form context
  const { control } = useFormContext<FieldValues>();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = React.useState<string>();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.files);
    setFileName(event.target.files?.item(0)?.name);
    getSelectedFiles(event.target.files);
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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
              <Input
                fieldSize={fieldSize}
                placeholder={fileName ?? "Select File"}
                className="!cursor-pointer pr-24"
                onClick={handleBrowseClick}
                readOnly
                {...{ type: "text", onChange: handleFileChange, ...props }}
                {...field}
                ref={field.ref}
              />

              <input
                type="file"
                disabled={disabled}
                className="hidden"
                accept={fileTypes?.join(",")}
                multiple={false}
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              {/* Browse Link Button (Inside the Input) */}
              <button
                type="button"
                onClick={handleBrowseClick}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-primary-500 hover:underline focus:outline-none"
              >
                Browse File
              </button>
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
