import { cn } from "@aventisia/ui/lib";
import { json } from "@codemirror/lang-json";
import CodeMirror from "@uiw/react-codemirror";
import React, { useEffect, useRef } from "react";

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
  const formattedOnLoad = useRef(false);

  // json formatter
  const formatJson = (raw?: string) => {
    try {
      const trimmed = raw?.trim();
      if (!trimmed) return;

      const parsed = JSON.parse(trimmed);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return;
    }
  };

  // Format when field first rendered
  useEffect(() => {
    if (formattedOnLoad.current) return;

    const formatted = formatJson(value);

    if (formatted && formatted !== value) {
      if (value.length > 7) formattedOnLoad.current = true; // set formatted true only when the content is present {"":""}.length==7
      onChange?.(formatted);
    }
  }, [value, onChange]);

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
      onBlur={() => {
        // Format on blur
        const formatted = formatJson(value);
        if (formatted) onChange?.(formatted);
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
