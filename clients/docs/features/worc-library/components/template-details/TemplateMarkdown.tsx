"use client"

import MarkdownViewer from "./MarkdownViewer";

interface Props {
  content: string;
}

export default function TemplateMarkdown({ content }: Props) {
  return <MarkdownViewer textValue={content} />;
}
