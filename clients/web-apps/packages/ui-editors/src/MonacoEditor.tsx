import { cn } from "@avplatform/ui/lib";
import type { FormFieldSizeType } from "@avplatform/ui/types";
import Editor, { type EditorProps, type OnChange } from "@monaco-editor/react";
import * as React from "react";

const aventisiaMonacoTheme = "aventisia-light";

interface MonacoEditorProps extends Omit<EditorProps, "onChange" | "className"> {
  /** Controls the outer container sizing — mirrors Textarea's size prop. */
  size?: FormFieldSizeType;
  /** Additional class names applied to the outer wrapper div. */
  className?: string;
  /** Standard React-like onChange; receives the new string value. */
  onChange?: (value: string) => void;
  /** The current value of the editor (controlled). */
  value?: string;
  /** Whether the editor is disabled. */
  disabled?: boolean;
}

const MonacoEditor = React.forwardRef<HTMLDivElement, MonacoEditorProps>(
  (
    {
      className,
      size = "base",
      onChange,
      value,
      disabled,
      language = "javascript",
      theme = aventisiaMonacoTheme,
      options,
      height = "160px",
      ...props
    },
    ref,
  ) => {
    const handleChange: OnChange = (newValue) => {
      onChange?.(newValue ?? "");
    };

    return (
      <div
        ref={ref}
        className={cn(
          "monaco-editor-shell w-full overflow-hidden rounded-lg border border-input bg-background shadow-sm shadow-black/5 ring-offset-background transition-shadow focus-within:border-primary focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring",
          disabled && "cursor-not-allowed opacity-80",
          className,
        )}
      >
        <Editor
          beforeMount={(monaco) => {
            // Monaco's defineTheme does NOT resolve CSS custom properties.
            // Hex values are derived from the corresponding CSS vars in index.css.
            monaco.editor.defineTheme(aventisiaMonacoTheme, {
              base: "vs",
              inherit: true,
              rules: [],
              colors: {
                // --background: hsl(0 0% 100%)
                "editor.background": "#ffffff",
                // --foreground: hsl(222.2 84% 4.9%)
                "editor.foreground": "#020817",
                // --muted: hsl(210 40% 96.1%)  ≈ slate-100
                "editorGutter.background": "#f1f5f9",
                // --muted-foreground: hsl(215.4 16.3% 46.9%)  ≈ slate-500
                "editorLineNumber.foreground": "#64748b",
                "editorLineNumber.activeForeground": "#020817",
                "editorGutter.foldingControlForeground": "#64748b",
                // --popover / --popover-foreground
                "menu.background": "#ffffff",
                "menu.foreground": "#020817",
                // --border: hsl(214.3 31.8% 91.4%)  ≈ slate-200
                "menu.border": "#e2e8f0",
                // --accent: hsl(226 100% 97%)  ≈ indigo-50
                "menu.selectionBackground": "#eff3ff",
                // --accent-foreground: hsl(222.2 47.4% 11.2%)  ≈ slate-900
                "menu.selectionForeground": "#0f172a",
                "menu.separatorBackground": "#e2e8f0",
              },
            });
          }}
          height={height}
          language={language}
          theme={theme}
          value={value}
          onChange={handleChange}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: size === "xs" ? 11.2 : size === "sm" ? 12 : 12.8,
            lineNumbersMinChars: 2,
            glyphMargin: false,
            folding: true,
            showFoldingControls: "always",
            readOnly: disabled,
            domReadOnly: disabled,
            ...options,
          }}
          {...props}
        />
      </div>
    );
  },
);

MonacoEditor.displayName = "MonacoEditor";

export { MonacoEditor, type MonacoEditorProps };
