import { cn } from "@avplatform/ui/lib";
// Language Modules
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { StreamLanguage } from "@codemirror/language";
import { csharp } from "@codemirror/legacy-modes/mode/clike";
import { powerShell } from "@codemirror/legacy-modes/mode/powershell";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { vbScript } from "@codemirror/legacy-modes/mode/vbscript";
// For standard CMD/Bash
import CodeMirror from "@uiw/react-codemirror";
import React, { useMemo } from "react";

// Note: Keep in sync with SUPPORTED_LANGUAGES in CodeEditorField.tsx
export type SupportedLanguage =
  "javascript" | "python" | "csharp" | "vb" | "powershell" | "cmd" | "sql" | "html";

type CodeEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  language?: SupportedLanguage;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value = "",
  onChange,
  language = "javascript",
  placeholder = "Enter script here...",
  disabled = false,
  className,
}) => {
  // Dynamically load the correct syntax highlighting extension
  const extensions = useMemo(() => {
    switch (language) {
      case "javascript":
        return [javascript({ jsx: true, typescript: true })];
      case "python":
        return [python()];
      case "sql":
        return [sql()];
      case "csharp":
        return [StreamLanguage.define(csharp)];
      case "vb":
        return [StreamLanguage.define(vbScript)];
      case "powershell":
        return [StreamLanguage.define(powerShell)];
      case "cmd":
        return [StreamLanguage.define(shell)];
      case "html":
        return [html()];

      default:
        return [javascript()];
    }
  }, [language]);

  return (
    <CodeMirror
      value={value}
      height={"auto"}
      extensions={extensions}
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
      className={cn(
        "flex min-h-20 w-full rounded-lg border border-input bg-background text-sm shadow-sm shadow-black/5 ring-offset-background transition-shadow placeholder:text-muted-foreground focus-within:border-primary focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring",
        disabled && "cursor-not-allowed opacity-80 focus-within:border-0 focus-within:ring-0",
        className,
      )}
    />
  );
};
