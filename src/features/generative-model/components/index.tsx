import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/react-toolkit/ui/resizable";

import { useEffect } from "react";

import { useFetchGenerativeModel } from "../hooks/useFetchGenerativeModel";
import { useSelectedTaskStore } from "../store/selected-task-store";
import GenerativeModelInput from "./generative-model-input/GenerativeModelInput";
import GenerativeModelOutput from "./generative-model-output/GenerativeModelOutput";

const GenerativeModel = () => {
  const { data, isLoading } = useFetchGenerativeModel();
  const { setSelectedTask } = useSelectedTaskStore();

  useEffect(() => {
    if (data?.data && !isLoading) {
      setSelectedTask(data?.data?.generativeModel?.name ?? "");
    }
  }, [data, isLoading, setSelectedTask]);

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
