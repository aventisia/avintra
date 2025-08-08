import { ScrollArea } from "@aventisia/ui/scroll";
import { Markdown } from "@llamaindex/chat-ui/widgets";

import { useGenerativeModelOutputStore } from "../../store/generative-model-output-store";

const GenerativeModelOutput = () => {
  const { conversationMarkdown } = useGenerativeModelOutputStore();
  return (
    <div className="rounded-lg bg-white shadow h-full flex flex-col max-w-screen-lg mx-auto self-center">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <p className="text-base font-medium">Output</p>
      </div>
      <ScrollArea className="mt-2 flex-grow h-[calc(100vh-14.2rem)] px-4">
        <Markdown content={conversationMarkdown}></Markdown>
      </ScrollArea>
    </div>
  );
};

export default GenerativeModelOutput;
