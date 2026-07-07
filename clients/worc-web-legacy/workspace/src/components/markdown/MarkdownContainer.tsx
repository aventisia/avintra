import { cn } from "@aventisia/ui/lib";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";

import MarkdownEditorInput from "./MarkdownEditorInput";
import MarkdownViewer from "./MarkdownViewer";

const MarkdownContainer = ({
  textValue,
  setTextValue,
  children,
  className,
}: {
  textValue: string;
  setTextValue: React.Dispatch<React.SetStateAction<string>>;
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <Tabs defaultValue="write" className={cn("w-full", className)}>
      <div className="flex justify-between">
        <TabsList>
          <TabsTrigger value="write">Write Instructions</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        {children}
      </div>
      <TabsContent
        className="min-h-[5rem]  rounded-lg border border-input bg-background p-2"
        value="write"
      >
        <MarkdownEditorInput value={textValue} setValue={setTextValue} />
      </TabsContent>
      <TabsContent
        className="min-h-[5rem]  rounded-lg border border-input bg-slate-50 p-2"
        value="preview"
      >
        <MarkdownViewer textValue={textValue} />
      </TabsContent>
    </Tabs>
  );
};

export default MarkdownContainer;
