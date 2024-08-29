import { useFormContext, FieldPath, FieldValues } from "react-hook-form";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormLabelExt } from "@/react-toolkit/ui/form/non-field/FormLabelExt";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";
import { MinimalTiptapEditor } from ".";
import { cn } from "@/react-toolkit/lib/utils";
import { BaseFieldProps } from "@/react-toolkit/ui/form/fields/base-field-props";
import { Content } from "@tiptap/react";

interface RichTextAreaFieldProps
  extends React.ComponentProps<typeof MinimalTiptapEditor>,
    BaseFieldProps {
  name: FieldPath<FieldValues>;
  throttleDelay?: number;
  className?: string;
  editorContentClassName?: string;
  output?: "html" | "json" | "text";
  placeholder?: string;
  autofocus?: boolean;
  immediatelyRender?: boolean;
  editable?: boolean;
  injectCSS?: boolean;
  editorClassName?: string;
  disabled?: boolean;
  value?: Content;
  onUpdate?: (content: Content) => void;
  onChange?: (value: Content) => void;
  onBlur?: (content: Content) => void;
}

const RichTextAreaField = ({
  name,
  label,
  isRequired,
  description,
  placeholder,
  disabled,
  className,
  editorContentClassName,
  output,
  editorClassName,
  ...props
}: RichTextAreaFieldProps) => {
  const { control } = useFormContext<FieldValues>();

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabelExt
              label={label}
              disabled={disabled}
              isRequired={isRequired}
              description={description}
            />
          )}
          <FormControl>
            <MinimalTiptapEditor
              {...field}
              editorContentClassName={editorContentClassName}
              output={output}
              editorClassName={cn(editorClassName, "rich-text-editor")}
              className={cn(className)}
              placeholder={placeholder}
              autofocus={false}
              immediatelyRender={true}
              editable={!disabled}
              injectCSS={true}
              {...props}
              ref={field.ref}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

RichTextAreaField.displayName = "RichTextAreaField";

export { RichTextAreaField, type RichTextAreaFieldProps };
