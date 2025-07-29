import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/react-toolkit/ui/resizable";

import ModelInput from "./model-input";
import ModelOutput from "./model-output";

const GenerativeModel = () => {
  return (
    <>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50} minSize={30}>
          <ModelInput />
        </ResizablePanel>
        <ResizableHandle withHandle className="ml-2 mr-0" />
        <ResizablePanel defaultSize={50} minSize={30}>
          <ModelOutput />
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
};

export default GenerativeModel;
