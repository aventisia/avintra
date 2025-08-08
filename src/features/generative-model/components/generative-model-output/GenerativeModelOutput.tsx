import { Separator } from "@aventisia/ui";
import { ScrollArea } from "@aventisia/ui/scroll";
import { Markdown } from "@llamaindex/chat-ui/widgets";

import { useFetchGenerativeModelOutputChatHistory } from "../../hooks/useFetchConversationHistory";
import { useGenerativeModelOutputStore } from "../../store/generative-model-output-store";

const GenerativeModelOutput = () => {
  const { conversationMarkdownList } = useGenerativeModelOutputStore();
  const { data } = useFetchGenerativeModelOutputChatHistory();

  console.log("Chat history", data?.data);
  return (
    <div className="rounded-lg bg-white shadow h-full flex flex-col max-w-screen-lg mx-auto self-center">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <p className="text-base font-medium">Output</p>
      </div>
      <ScrollArea className="my-4 flex-grow h-[calc(100vh-14.2rem)] px-4">
        <div className="space-y-4">
          {conversationMarkdownList.map((item, idx) => {
            return (
              <>
                <Markdown
                  key={item.conversationId}
                  content={item.message}
                  className="bg-muted rounded-lg px-4 py-1"
                ></Markdown>
                {idx < conversationMarkdownList.length - 1 && <Separator />}
              </>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default GenerativeModelOutput;
