import { cn } from "@avplatform/ui/lib";
import type { Editor } from "@tiptap/core";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Typography } from "@tiptap/extension-typography";
import type { Content, UseEditorOptions } from "@tiptap/react";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import * as React from "react";

import { sanitizeHtml } from "@/features/05-tenant-admin/support-tickets-table/utils/htmlSanitizer";

import {
  CodeBlockLowlight,
  Color,
  HorizontalRule,
  Image,
  Link,
  ResetMarksOnEnter,
  Selection,
  UnsetAllMarks,
} from "../extensions";
import { getOutput } from "../utils/utils";
import { useThrottle } from "./use-throttle";

export interface UseMinimalTiptapEditorProps extends UseEditorOptions {
  value?: Content;
  output?: "html" | "json" | "text";
  placeholder?: string;
  editorClassName?: string;
  throttleDelay?: number;
  onUpdate?: (content: Content) => void;
  onBlur?: (content: Content) => void;
}

const createExtensions = (placeholder: string) => [
  StarterKit.configure({
    horizontalRule: false,
    codeBlock: false,
    paragraph: { HTMLAttributes: { class: "text-node" } },
    heading: { HTMLAttributes: { class: "heading-node" } },
    blockquote: { HTMLAttributes: { class: "block-node" } },
    bulletList: { HTMLAttributes: { class: "list-node" } },
    orderedList: { HTMLAttributes: { class: "list-node" } },
    code: { HTMLAttributes: { class: "inline", spellcheck: "false" } },
    dropcursor: { width: 2, class: "ProseMirror-dropcursor border" },
  }),
  Link,
  Image,
  Color,
  TextStyle,
  Selection,
  Typography,
  UnsetAllMarks,
  HorizontalRule,
  ResetMarksOnEnter,
  CodeBlockLowlight,
  Placeholder.configure({ placeholder: () => placeholder }),
];

export const useMinimalTiptapEditor = ({
  value,
  output = "html",
  placeholder = "",
  editorClassName,
  throttleDelay = 1000,
  onUpdate,
  onBlur,
  ...props
}: UseMinimalTiptapEditorProps) => {
  const throttledSetValue = useThrottle((value: Content) => onUpdate?.(value), throttleDelay);

  const handleUpdate = React.useCallback(
    (editor: Editor) => {
      // Get the raw HTML output from the editor (it can be in string or JSONContent form)
      const content = getOutput(editor, output);

      // If it's JSONContent, convert it to HTML string
      const htmlContent = typeof content === "string" ? content : editor.getHTML();

      // Now sanitize the HTML string (sanitizeHtml expects a string, not JSONContent)
      const sanitizedContent = sanitizeHtml(htmlContent);

      // Pass the sanitized content to the throttled set function
      throttledSetValue(sanitizedContent);
    },
    [output, throttledSetValue],
  );

  const handleCreate = React.useCallback(
    (editor: Editor) => {
      if (value && editor.isEmpty) {
        // If value is JSONContent or JSONContent[], convert it to HTML string
        let htmlValue: string;
        if (typeof value === "string") {
          htmlValue = value; // If it's already a string (HTML), use it directly
        } else {
          htmlValue = editor.getHTML(); // Convert JSONContent to HTML string
        }

        // Sanitize the HTML string
        const sanitizedValue = sanitizeHtml(htmlValue);

        // Set the sanitized HTML content in the editor
        editor.commands.setContent(sanitizedValue); // setContent internally handles conversion to JSONContent
      }
    },
    [value],
  );

  const handleBlur = React.useCallback(
    (editor: Editor) => {
      // Get the raw HTML output from the editor (it can be in string or JSONContent form)
      const content = getOutput(editor, output);

      // If it's JSONContent, convert it to HTML string
      const htmlContent = typeof content === "string" ? content : editor.getHTML();

      // Sanitize the HTML string
      const sanitizedContent = sanitizeHtml(htmlContent);

      // Pass sanitized content to onBlur handler
      onBlur?.(sanitizedContent);
    },
    [output, onBlur],
  );

  const editor = useEditor({
    extensions: createExtensions(placeholder!),
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        class: cn("focus:outline-none", editorClassName),
      },
    },
    onUpdate: ({ editor }) => handleUpdate(editor),
    onCreate: ({ editor }) => handleCreate(editor),
    onBlur: ({ editor }) => handleBlur(editor),
    ...props,
  });

  return editor;
};

export default useMinimalTiptapEditor;
