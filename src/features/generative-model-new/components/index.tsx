import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/react-toolkit/ui/resizable";

import GenerativeModelInput from "./generative-model-input/GenerativeModelInput";
import GenerativeModelOutput from "./generative-model-output/GenerativeModelOutput";

const GenerativeModel = () => {
  return (
    <>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50} minSize={30}>
          <GenerativeModelInput />
        </ResizablePanel>
        <ResizableHandle withHandle className="ml-2 mr-0" />
        <ResizablePanel defaultSize={50} minSize={30}>
          <GenerativeModelOutput />
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
};

export default GenerativeModel;
