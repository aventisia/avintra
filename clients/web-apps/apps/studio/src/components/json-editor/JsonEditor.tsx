import { cn } from "@avplatform/ui/lib";
import { useThemeStore } from "@avplatform/ui/stores";
import { json } from "@codemirror/lang-json";
import CodeMirror from "@uiw/react-codemirror";
import React, { useEffect, useRef, useState } from "react";

interface JsonEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * JSON code editor with display-only pretty-printing.
 *
 * Keeps its own display value: user typing flows to the form via onChange,
 * while formatting (mount / blur) and external resets (form reset, node
 * switch) only touch the display. Programmatic changes therefore never mark
 * the form dirty.
 */
export const JsonEditor: React.FC<JsonEditorProps> = ({
  value = "{}",
  onChange,
  placeholder = "Enter JSON here...",
  disabled = false,
  className,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  // The editor keeps its own display value so pretty-printing is cosmetic and
  // never marks the form dirty (programmatic CodeMirror changes are not echoed).
  const [displayValue, setDisplayValue] = useState(value);
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
      setDisplayValue(formatJson(value) ?? value);
    }
  }, [value]);

  // Pretty-print the initial value for display only
  useEffect(() => {
    if (formattedOnMount.current) return;
    formattedOnMount.current = true;

    const formatted = formatJson(value);
    if (formatted && formatted !== value) {
      setDisplayValue(formatted);
    }
  }, [value]);

  const handleChange = (next: string) => {
    lastValueRef.current = next;
    setDisplayValue(next);
    onChange?.(next);
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
