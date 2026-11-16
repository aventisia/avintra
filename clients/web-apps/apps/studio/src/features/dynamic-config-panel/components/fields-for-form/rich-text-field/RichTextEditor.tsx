import { FormControl } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { EditorContent, useEditor } from "@tiptap/react";
import * as React from "react";
import { ControllerRenderProps, FieldValues } from "react-hook-form";

import { VariableSelectorWrapper } from "@/components/variable-selector/VariableSelectorWrapper";

import { richTextExtensions } from "../../../constants/rich-text-extensions.constant";
import { useVariableInsertion } from "../../../hooks/useVariableInsertion.hook";
import { survivesVisualEditing, toStoredRichTextValue } from "../../../utils/rich-text-value.util";
import { VariablesTrigger } from "../VariablesTrigger";
import { RichTextToolbar } from "./RichTextToolbar";

type RichTextEditorProps = {
  field: ControllerRenderProps<FieldValues, string>;
  label?: string;
  disabled?: boolean;
  onUnsupportedValue: () => void;
};

const RichTextEditor = ({ field, label, disabled, onUnsupportedValue }: RichTextEditorProps) => {
  const storedValueRef = React.useRef<unknown>(field.value);

  const editor = useEditor({
    extensions: richTextExtensions,
    content: field.value ?? "",
    editable: !disabled,
    editorProps: {
      attributes: {
        "aria-label": label ?? field.name,
        class: cn(
          "max-h-72 min-h-16 overflow-y-auto px-2 py-1.5 text-sm outline-none",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold",
          "[&_a]:text-primary [&_a]:underline",
        ),
      },
    },
    onUpdate: ({ editor }) => {
      storedValueRef.current = toStoredRichTextValue(editor.getHTML());
      field.onChange(storedValueRef.current);
    },
    onBlur: () => field.onBlur(),
  });

  React.useEffect(() => {
    if (!editor || field.value === storedValueRef.current) return;
    storedValueRef.current = field.value;
    const value = typeof field.value === "string" ? field.value : "";
    if (survivesVisualEditing(value)) editor.commands.setContent(value, false);
    else onUnsupportedValue();
  }, [editor, field.value, onUnsupportedValue]);

  useVariableInsertion(field.name, (token) =>
    editor?.chain().focus().insertContent({ type: "text", text: token }).run(),
  );

  if (!editor) return null;

  return (
    <VariableSelectorWrapper inputUniqueName={field.name}>
      <div className="group relative">
        <VariablesTrigger name={field.name} className="-top-5" />
        <FormControl>
          <div
            className={cn(
              "rounded-md border border-input bg-transparent focus-within:ring-1 focus-within:ring-ring",
              disabled && "opacity-50",
            )}
          >
            {!disabled && <RichTextToolbar editor={editor} />}
            <EditorContent editor={editor} />
          </div>
        </FormControl>
      </div>
    </VariableSelectorWrapper>
  );
};

export { RichTextEditor };
