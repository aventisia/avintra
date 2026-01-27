import { cn } from "@aventisia/ui/lib";
import { json } from "@codemirror/lang-json";
import CodeMirror from "@uiw/react-codemirror";
import React from "react";

interface JsonEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value = "{}",
  onChange,
  placeholder = "Enter JSON here...",
  disabled = false,
  className,
}) => {
  return (
    <CodeMirror
      value={value}
      height={"auto"}
      extensions={[json()]}
      onChange={onChange}
      editable={!disabled}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
        autocompletion: true,
        bracketMatching: true,
      }}
      placeholder={placeholder}
      theme="light"
      contentEditable={disabled}
      aria-disabled={disabled}
      onBlur={() => {
        try {
          if (value) {
            const formatted = JSON.stringify(JSON.parse(value), null, 2);
            onChange?.(formatted);
          }
        } catch {
          // ignore invalid JSON
        }
      }}
      className={cn(
        "flex min-h-20 w-full rounded-lg border border-input bg-background text-sm shadow-sm shadow-black/5 ring-offset-background transition-shadow placeholder:text-muted-foreground focus-within:border-primary focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring",
        disabled &&
          "cursor-not-allowed opacity-80 focus-within:border-0 focus-within:ring-0",
        className,
      )}
    />
  );
};
