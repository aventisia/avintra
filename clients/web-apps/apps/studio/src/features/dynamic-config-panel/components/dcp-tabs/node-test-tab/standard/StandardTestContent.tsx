import { useShallow } from "zustand/react/shallow";

import { DCPTabsContent } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsContent";
import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel/stores/dcp-store";

import RetrieveDocumentsTest from "./RetrieveDocumentsTest";
import STJsonViewer from "./STJsonViewer";

const StandardTestContent = ({
  formData,
}: {
  formData: {
    [x: string]: unknown;
  };
}) => {
  const { nodeData } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      nodeData: state.nodeData,
    })),
  );
  if (nodeData?.name == "VectorStore/RetrieveDocumentsConnector")
    return <RetrieveDocumentsTest formData={formData} />;

  return (
    <DCPTabsContent tabValue="Test">
      <div className="space-y-3 pb-2">
        <STJsonViewer jsonData={JSON.stringify(nodeData?.inputs)} label="Inputs" />
        <STJsonViewer jsonData={JSON.stringify(nodeData?.outputs)} label="Outputs" />
      </div>
    </DCPTabsContent>
  );
};

export default StandardTestContent;
