import MarkdownEditor from "@uiw/react-markdown-editor";

export default function MarkdownEditorInput({
  value,
  setValue,
}: {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <MarkdownEditor
      value={value}
      onChange={(val) => setValue(val || "")}
      height={"auto"}
      toolbars={["header", "italic", "bold", "olist", "ulist", "link", "quote", "underline"]}
      toolbarsMode={[]}
      width="100%"
      previewWidth="0%"
      enableScroll={false}
      enablePreview={false}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: false,
      }}
      className="text-wrap rounded-lg border-0 bg-sunken p-0 text-sm text-foreground"
      theme="light"
    />
  );
}
