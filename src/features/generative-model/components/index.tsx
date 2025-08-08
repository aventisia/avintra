import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/react-toolkit/ui/resizable";

import { useEffect } from "react";

import { useFetchGenerativeModelOutputChatHistory } from "../hooks/useFetchConversationHistory";
import { useFetchGenerativeModel } from "../hooks/useFetchGenerativeModel";
import { useGenerativeModelOutputStore } from "../store/generative-model-output-store";
import { useSelectedTaskStore } from "../store/selected-task-store";
import GenerativeModelInput from "./generative-model-input/GenerativeModelInput";
import GenerativeModelOutput from "./generative-model-output/GenerativeModelOutput";

const GenerativeModel = () => {
  const { data, isLoading } = useFetchGenerativeModel();
  const { setSelectedTask } = useSelectedTaskStore();
  const { data: chatHistory, isLoading: chatHistoryLoading } =
    useFetchGenerativeModelOutputChatHistory();
  const { setConversationMarkdown } = useGenerativeModelOutputStore();

  useEffect(() => {
    if (data?.data && !isLoading) {
      setSelectedTask(data?.data?.generativeModel?.name ?? "");
    }
  }, [data, isLoading, setSelectedTask]);

  useEffect(() => {
    if (chatHistory?.data && !chatHistoryLoading) {
      setConversationMarkdown(chatHistory?.data || []);
    }
  }, [chatHistory, chatHistoryLoading, setConversationMarkdown]);

  return (
    <>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50} minSize={30}>
          <GenerativeModelInput />
        </ResizablePanel>
        <ResizableHandle withHandle className="ml-2 mr-2" />
        <ResizablePanel defaultSize={50} minSize={30}>
          <GenerativeModelOutput />
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
};

export default GenerativeModel;
