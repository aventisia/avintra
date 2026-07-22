import { cn } from "@avplatform/ui/lib";
import type { Extension } from "@codemirror/state";
import CodeMirror from "@uiw/react-codemirror";
import React, { useEffect, useState } from "react";

export type SupportedLanguage =
  // Official @codemirror/lang-* packages
  | "javascript"
  | "typescript"
  | "jsx"
  | "tsx"
  | "python"
  | "css"
  | "html"
  | "java"
  | "json"
  | "markdown"
  | "sql"
  | "xml"
  | "yaml"
  | "cpp"
  | "rust"
  | "go"
  | "php"
  | "sass"
  | "vue"
  // Legacy modes via @codemirror/legacy-modes
  | "csharp"
  | "kotlin"
  | "scala"
  | "vb"
  | "vbscript"
  | "powershell"
  | "shell"
  | "cmd"
  | "ruby"
  | "perl"
  | "r"
  | "swift"
  | "lua"
  | "groovy"
  | "haskell"
  | "toml"
  | "dockerfile";

export interface CodeEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: SupportedLanguage;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

async function loadLanguageExtension(language: SupportedLanguage): Promise<Extension[]> {
  switch (language) {
    case "javascript":
      return [(await import("@codemirror/lang-javascript")).javascript()];
    case "typescript":
      return [
        (await import("@codemirror/lang-javascript")).javascript({
          typescript: true,
        }),
      ];
    case "jsx":
      return [(await import("@codemirror/lang-javascript")).javascript({ jsx: true })];
    case "tsx":
      return [
        (await import("@codemirror/lang-javascript")).javascript({
          jsx: true,
          typescript: true,
        }),
      ];
    case "python":
      return [(await import("@codemirror/lang-python")).python()];
    case "css":
      return [(await import("@codemirror/lang-css")).css()];
    case "html":
      return [(await import("@codemirror/lang-html")).html()];
    case "java":
      return [(await import("@codemirror/lang-java")).java()];
    case "json":
      return [(await import("@codemirror/lang-json")).json()];
    case "markdown":
      return [(await import("@codemirror/lang-markdown")).markdown()];
    case "sql":
      return [(await import("@codemirror/lang-sql")).sql()];
    case "xml":
      return [(await import("@codemirror/lang-xml")).xml()];
    case "yaml":
      return [(await import("@codemirror/lang-yaml")).yaml()];
    case "cpp":
      return [(await import("@codemirror/lang-cpp")).cpp()];
    case "rust":
      return [(await import("@codemirror/lang-rust")).rust()];
    case "go":
      return [(await import("@codemirror/lang-go")).go()];
    case "php":
      return [(await import("@codemirror/lang-php")).php()];
    case "sass":
      return [(await import("@codemirror/lang-sass")).sass()];
    case "vue":
      return [(await import("@codemirror/lang-vue")).vue()];
    case "csharp": {
      const { StreamLanguage } = await import("@codemirror/language");
      const { csharp } = await import("@codemirror/legacy-modes/mode/clike");
      return [StreamLanguage.define(csharp)];
    }
    case "kotlin": {
      const { StreamLanguage } = await import("@codemirror/language");
      const { kotlin } = await import("@codemirror/legacy-modes/mode/clike");
      return [StreamLanguage.define(kotlin)];
    }
    case "scala": {
      const { StreamLanguage } = await import("@codemirror/language");
      const { scala } = await import("@codemirror/legacy-modes/mode/clike");
      return [StreamLanguage.define(scala)];
    }
    case "vb": {
      const { StreamLanguage } = await import("@codemirror/language");
      const { vb } = await import("@codemirror/legacy-modes/mode/vb");
      return [StreamLanguage.define(vb)];
    }
    case "vbscript": {
      const { StreamLanguage } = await import("@codemirror/language");
      const { vbScript } = await import("@codemirror/legacy-modes/mode/vbscript");
      return [StreamLanguage.define(vbScript)];
    }
    case "powershell": {
      const { StreamLanguage } = await import("@codemirror/language");
      const { powerShell } = await import("@codemirror/legacy-modes/mode/powershell");
      return [StreamLanguage.define(powerShell)];
    }
    case "shell":
    case "cmd": {
      const { StreamLanguage } = await import("@codemirror/language");
      const { shell } = await import("@codemirror/legacy-modes/mode/shell");
      return [StreamLanguage.define(shell)];
    }
    case "ruby": {
      const { StreamLanguage } = await import("@codemirror/language");
      const { ruby } = await import("@codemirror/legacy-modes/mode/ruby");
      return [StreamLanguage.define(ruby)];
    }
    case "perl": {
      const { StreamLanguage } = await import("@codemirror/language");
      const { perl } = await import("@codemirror/legacy-modes/mode/perl");
      return [StreamLanguage.define(perl)];
    }
    case "r": {
      const { StreamLanguage } = await import("@codemirror/language");
      const { r } = await import("@codemirror/legacy-modes/mode/r");
      return [StreamLanguage.define(r)];
    }
    case "swift": {
      const { StreamLanguage } = await import("@codemirror/language");
      const { swift } = await import("@codemirror/legacy-modes/mode/swift");
      return [StreamLanguage.define(swift)];
    }
    case "lua": {
      const { StreamLanguage } = await import("@codemirror/language");
      const { lua } = await import("@codemirror/legacy-modes/mode/lua");
      return [StreamLanguage.define(lua)];
    }
    case "groovy": {
      const { StreamLanguage } = await import("@codemirror/language");
      const { groovy } = await import("@codemirror/legacy-modes/mode/groovy");
      return [StreamLanguage.define(groovy)];
    }
    case "haskell": {
      const { StreamLanguage } = await import("@codemirror/language");
      const { haskell } = await import("@codemirror/legacy-modes/mode/haskell");
      return [StreamLanguage.define(haskell)];
    }
    case "toml": {
      const { StreamLanguage } = await import("@codemirror/language");
      const { toml } = await import("@codemirror/legacy-modes/mode/toml");
      return [StreamLanguage.define(toml)];
    }
    case "dockerfile": {
      const { StreamLanguage } = await import("@codemirror/language");
      const { dockerFile } = await import("@codemirror/legacy-modes/mode/dockerfile");
      return [StreamLanguage.define(dockerFile)];
    }
    default:
      return [(await import("@codemirror/lang-javascript")).javascript()];
  }
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value = "",
  onChange,
  language = "javascript",
  placeholder = "Enter script here...",
  disabled = false,
  className,
}) => {
  const [extensions, setExtensions] = useState<Extension[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadLanguageExtension(language).then((ext) => {
      if (!cancelled) setExtensions(ext);
    });
    return () => {
      cancelled = true;
    };
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
