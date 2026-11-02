import { cn } from "@avplatform/ui/lib";
import { useThemeStore } from "@avplatform/ui/stores";
import { json } from "@codemirror/lang-json";
import CodeMirror from "@uiw/react-codemirror";
import React, { useEffect, useRef, useState } from "react";

interface JsonEditorProps {
  /** JSON text, or a structured value ({}/[]) that is serialized for display. */
  value?: unknown;
  onChange?: (value: unknown) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const isStructuredValue = (value: unknown): boolean => value !== null && typeof value === "object";

const toEditorText = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  try {
    return JSON.stringify(value, null, 2) ?? "";
  } catch {
    return "";
  }
};

const fromEditorText = (text: string, structured: boolean): unknown => {
  if (!structured) return text;
  const trimmed = text.trim();
  if (!trimmed) return text;
  try {
    return JSON.parse(trimmed);
  } catch {
    return text;
  }
};

/**
 * JSON code editor with display-only pretty-printing.
 *
 * Accepts JSON text or a structured object/array value and emits edits in the
 * same shape so the code editor never receives a raw object.
 */
export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter JSON here...",
  disabled = false,
  className,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const structuredRef = useRef(isStructuredValue(value));
  const [displayValue, setDisplayValue] = useState(() => toEditorText(value));
  const lastValueRef = useRef(value);
  const formattedOnMount = useRef(false);

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

  // Pull in external value changes (form reset / node switch) without echoing
  useEffect(() => {
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
      structuredRef.current = isStructuredValue(value);
      const text = toEditorText(value);
      setDisplayValue(formatJson(text) ?? text);
    }
  }, [value]);

  // Pretty-print the initial value for display only
  useEffect(() => {
    if (formattedOnMount.current) return;
    formattedOnMount.current = true;

    const text = toEditorText(value);
    const formatted = formatJson(text);
    if (formatted && formatted !== text) {
      setDisplayValue(formatted);
    }
  }, [value]);

  const handleChange = (next: string) => {
    const emitted = fromEditorText(next, structuredRef.current);
    lastValueRef.current = emitted;
    setDisplayValue(next);
    onChange?.(emitted);
  };

  // Format on blur for display only; the form value is only ever changed by the user
  const handleBlur = () => {
    const formatted = formatJson(displayValue);
    if (formatted && formatted !== displayValue) {
      setDisplayValue(formatted);
    }
  };

  return (
    <CodeMirror
      value={displayValue}
      height={"auto"}
      extensions={[json()]}
      onChange={handleChange}
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
      theme={isDark ? "dark" : "light"}
      contentEditable={disabled}
      aria-disabled={disabled}
      onBlur={handleBlur}
      className={cn(
        "flex min-h-20 w-full rounded-lg border border-input bg-background text-sm ring-offset-background transition-shadow placeholder:text-muted-foreground focus-within:border-primary focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring",
        disabled && "cursor-not-allowed opacity-80 focus-within:border-0 focus-within:ring-0",
        className,
      )}
    />
  );
};
