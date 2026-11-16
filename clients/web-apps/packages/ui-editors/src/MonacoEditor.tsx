import { cn } from "@avplatform/ui/lib";
import { useThemeStore } from "@avplatform/ui/stores";
import type { FormFieldSizeType } from "@avplatform/ui/types";
import Editor, {
  type EditorProps,
  type Monaco,
  type OnChange,
  useMonaco,
} from "@monaco-editor/react";
import * as React from "react";

const aventisiaMonacoTheme = "aventisia-ink";

const readInkColor = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// IMPORTANT NOTE: Monaco's defineTheme does not resolve CSS custom properties, so the Ink values are read at runtime and the theme is redefined whenever the app theme flips.
const defineInkTheme = (monaco: Monaco) => {
  const isDark = document.documentElement.classList.contains("dark");
  monaco.editor.defineTheme(aventisiaMonacoTheme, {
    base: isDark ? "vs-dark" : "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": readInkColor("--surface"),
      "editor.foreground": readInkColor("--ink"),
      "editorGutter.background": readInkColor("--sunken"),
      "editorLineNumber.foreground": readInkColor("--muted-ink"),
      "editorLineNumber.activeForeground": readInkColor("--ink"),
      "editorGutter.foldingControlForeground": readInkColor("--muted-ink"),
      "menu.background": readInkColor("--surface"),
      "menu.foreground": readInkColor("--ink"),
      "menu.border": readInkColor("--line"),
      "menu.selectionBackground": readInkColor("--hover"),
      "menu.selectionForeground": readInkColor("--ink"),
      "menu.separatorBackground": readInkColor("--line"),
    },
  });
};

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
    const monaco = useMonaco();
    const isDark = useThemeStore((state) => state.isDark);

    React.useEffect(() => {
      if (!monaco || theme !== aventisiaMonacoTheme) return;
      defineInkTheme(monaco);
      monaco.editor.setTheme(aventisiaMonacoTheme);
    }, [monaco, isDark, theme]);

    const handleChange: OnChange = (newValue) => {
      onChange?.(newValue ?? "");
    };

    return (
      <div
        ref={ref}
        className={cn(
          "monaco-editor-shell w-full overflow-hidden rounded-lg border border-input bg-surface ring-offset-background transition-shadow duration-[120ms] motion-reduce:transition-none focus-within:border-primary focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring",
          disabled && "cursor-not-allowed opacity-80",
          className,
        )}
      >
        <Editor
          beforeMount={defineInkTheme}
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
