import { ScrollArea } from "@aventisia/ui/scroll";

import LLMChat from "./llm-chat/LLMChat";
import ModelLibrary from "./model-library/ModelLibrary";
import ScratchTemplate from "./template";

const InitializeApp = () => {
  return (
    <ScrollArea className="h-[calc(100vh-3.5rem)] pt-16 pb-6 px-6 bg-white">
      <div className="flex flex-col gap-4 h-full w-full max-w-screen-xl mx-auto">
        <LLMChat />
        <ScratchTemplate />
        <ModelLibrary />
      </div>
    </ScrollArea>
  );
};

export default InitializeApp;
