import React from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { sql } from "@codemirror/lang-sql";
import { vb } from "@codemirror/legacy-modes/mode/vb";
import { xml } from "@codemirror/lang-xml";
import { powerShell } from "@codemirror/legacy-modes/mode/powershell";
import { StreamLanguage } from "@codemirror/language";
import { githubLight } from "@uiw/codemirror-theme-github";
import { cn } from "@aventisia/ui/lib";

interface CodeEditorProps {
  language?:
    | "javascript"
    | "typescript"
    | "sql"
    | "python"
    | "cpp"
    | "powershell"
    | "html"
    | "vbscript"
    | "csharp"
    | "xml";
  value?: string;
  onChange?: (value: string) => void;
  height?: string;
  className?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  language = "",
  value = "",
  onChange,
  height = "",
  className = "",
}) => {
  const getLanguageExtension = () => {
    switch (language) {
      case "javascript":
        return javascript();
      case "python":
        return python();
      case "html":
        return html();
      case "sql":
        return sql();
      case "vbscript":
        return StreamLanguage.define(vb);
      case "powershell":
        return StreamLanguage.define(powerShell);
      case "csharp":
        return javascript({ typescript: true });
      case "xml":
        return xml();
      default:
        return javascript();
    }
  };

  return (
    <div
      className={cn(
        `flex max-h-96 min-h-36 ${height} w-full overflow-y-auto rounded-md border border-input`,
        "bg-background py-2 text-sm ring-offset-background",
        "placeholder:text-muted-foreground focus-visible:border-primary",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-80",
        className,
      )}
    >
      <CodeMirror
        value={value}
        height="100%"
        theme={githubLight}
        extensions={[
          getLanguageExtension(),
          EditorView.lineWrapping, // ✅ this enables word wrap
        ]}
        onChange={(value) => onChange?.(value)}
        className="h-full w-full overflow-hidden rounded-md text-sm"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
      />
    </div>
  );
};
