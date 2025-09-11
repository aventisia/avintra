import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import MarkdownEditorInput from "./MarkdownEditorInput";
import MarkdownViewer from "./MarkdownViewer";
import { Button } from "@aventisia/ui/buttons";
import { SparklesIcon } from "lucide-react";
const MarkdownContainer = ({
  textValue,
  setTextValue,
}: {
  textValue: string;
  setTextValue: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <Tabs defaultValue="write" className="w-full">
      <div className="flex justify-between">
        <TabsList>
          <TabsTrigger value="write">Write Instructions</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <Button
          variant="outline"
          size={"sm"}
          className="flex items-center gap-2 border-primary text-primary transition-all duration-200 hover:bg-primary hover:text-white"
          type="button"
        >
          <SparklesIcon className="h-4 w-4" />
          Generate
        </Button>
      </div>
      <TabsContent
        className="min-h-[5rem] w-[56.5vw] rounded-lg border border-input bg-background p-2"
        value="write"
      >
        <MarkdownEditorInput value={textValue} setValue={setTextValue} />
      </TabsContent>
      <TabsContent
        className="min-h-[5rem] w-[56.5vw] rounded-lg border border-input bg-slate-50 p-2"
        value="preview"
      >
        <MarkdownViewer textValue={textValue} />
      </TabsContent>
    </Tabs>
  );
};

export default MarkdownContainer;
