import { useShallow } from "zustand/react/shallow";

import { DCPTabsContent } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsContent";
import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel/stores/dcp-store";

import STJsonViewer from "./STJsonViewer";

const StandardTestContent = () => {
  const { nodeData } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      nodeData: state.nodeData,
    })),
  );

  return (
    <DCPTabsContent tabValue="Test" hasFooter={false}>
      <STJsonViewer
        jsonData={JSON.stringify(nodeData?.inputs)}
        label="Inputs"
        className="mb-5 mt-1.5"
      />
      <STJsonViewer
        jsonData={JSON.stringify(nodeData?.outputs)}
        label="Outputs"
      />
    </DCPTabsContent>
  );
};

export default StandardTestContent;
