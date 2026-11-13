import {
  SEGMENTED_TABS_LIST_CLASS,
  SEGMENTED_TABS_TRIGGER_CLASS,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@avplatform/ui/tabs";

import MarkdownEditorInput from "./MarkdownEditorInput";
import MarkdownViewer from "./MarkdownViewer";

const PANEL_CLASS = "mt-2 min-h-[6rem] w-full rounded-md p-2 ring-1";

const MarkdownContainer = ({
  textValue,
  setTextValue,
  children,
}: {
  textValue: string;
  setTextValue: React.Dispatch<React.SetStateAction<string>>;
  children: React.ReactNode;
}) => {
  return (
    <Tabs defaultValue="write" className="w-full">
      <div className="flex items-center justify-between gap-3">
        <TabsList className={SEGMENTED_TABS_LIST_CLASS}>
          <TabsTrigger value="write" className={SEGMENTED_TABS_TRIGGER_CLASS}>
            Write
          </TabsTrigger>
          <TabsTrigger value="preview" className={SEGMENTED_TABS_TRIGGER_CLASS}>
            Preview
          </TabsTrigger>
        </TabsList>
        {children}
      </div>
      <TabsContent
        className={`${PANEL_CLASS} bg-sunken ring-border transition-shadow focus-within:ring-focus`}
        value="write"
      >
        <MarkdownEditorInput value={textValue} setValue={setTextValue} />
      </TabsContent>
      <TabsContent className={`${PANEL_CLASS} bg-sunken/60 ring-line`} value="preview">
        <MarkdownViewer textValue={textValue} />
      </TabsContent>
    </Tabs>
  );
};

export default MarkdownContainer;
