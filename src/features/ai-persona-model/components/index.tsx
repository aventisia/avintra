import ErrorFetchingTemplate from "@/components/templates/ErrorFetchingTemplate";
import LoaderTemplate from "@/components/templates/LoaderTemplate";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/react-toolkit/ui/resizable";

import { useShallow } from "zustand/react/shallow";

import { useFetchSetupFormData } from "../hooks/useFetchSetupFormData";
import { useTempChatStore } from "../store/temp-chat-store";
import AIPersonaSetupForm from "./setup/AIPersonaSetupForm";
import AIPersonaTestForm from "./test/AIPersonaTestForm";

const AIPersonaModel = () => {
  const { isLoading, isError } = useFetchSetupFormData();

  // -----------------------------------------------
  const {
    chatConfig: { assistantName },
  } = useTempChatStore(
    useShallow((state) => ({
      chatConfig: state.chatConfig,
    })),
  );
  // -----------------------------------------------

  return (
    <div className="rounded-lg bg-white border shadow-sm h-[calc(100vh-4.95rem)] flex">
      <ResizablePanelGroup direction="horizontal">
        {/* prompt setup */}
        <ResizablePanel defaultSize={50} minSize={40}>
          <div className="flex text-md font-semibold items-center border-b px-4 py-2.5">
            Persona Setup
          </div>
          {isLoading ? (
            <LoaderTemplate />
          ) : isError ? (
            <ErrorFetchingTemplate />
          ) : (
            <AIPersonaSetupForm />
          )}
        </ResizablePanel>

        {/* separator */}
        <ResizableHandle withHandle className="w-[0.5px]" />

        {/* chat testing */}
        <ResizablePanel defaultSize={50} minSize={40}>
          <div className="flex text-md font-semibold items-center border-b px-4 py-2.5">
            Chat {assistantName && ` with ${assistantName}`}
          </div>
          <AIPersonaTestForm />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default AIPersonaModel;
