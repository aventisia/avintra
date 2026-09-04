import { FormControl, FormLabelExt } from "@avplatform/ui/form";
import { FormField, FormItem, FormMessage } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { FormFieldSizeType } from "@avplatform/ui/types";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { CodeEditor, SupportedLanguage } from "./CodeEditor";

interface CodeEditorFieldProps {
  /**
   * The name of the form field.
   * The language is automatically derived from the suffix after the last underscore
   * (e.g., "Config_javascript" -> "javascript").
   */
  name: FieldPath<FieldValues>;

  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  isRequired?: boolean;
  size?: FormFieldSizeType;
  placeholder?: string;
}

// Note: Keep in sync with SupportedLanguage in CodeEditor.tsx
const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  "javascript",
  "python",
  "csharp",
  "vb",
  "powershell",
  "cmd",
  "sql",
];

const CodeEditorField = ({
  name,
  label,
  description,
  className,
  disabled,
  isRequired,
  size = "base",
  placeholder,
}: CodeEditorFieldProps) => {
  const { control } = useFormContext<FieldValues>();

  // 1. Convert the name to a string (handles deep paths like 'steps.0.Config_python')
  const nameString = String(name);

  // 2. Extract the suffix after the last underscore
  const possibleLanguage = nameString.split("_").pop();

  // 3. Validate against your supported types, fallback to javascript if not found
  const derivedLanguage = SUPPORTED_LANGUAGES.includes(possibleLanguage as SupportedLanguage)
    ? (possibleLanguage as SupportedLanguage)
    : "javascript";

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem size={size}>
          <FormLabelExt
            size={size}
            label={label}
            isRequired={isRequired && !disabled}
            description={description}
          />
          <FormControl>
            <CodeEditor
              value={field.value}
              onChange={field.onChange}
              language={derivedLanguage}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(className)}
            />
          </FormControl>
          <FormMessage size={size} />
        </FormItem>
      )}
    />
  );
};

CodeEditorField.displayName = "CodeEditorField";

export { CodeEditorField, type CodeEditorFieldProps };
