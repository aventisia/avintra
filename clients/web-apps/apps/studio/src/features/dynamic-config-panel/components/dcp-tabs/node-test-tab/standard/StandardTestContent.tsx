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
    <DCPTabsContent tabValue="Test" hasFooter={false}>
      <STJsonViewer
        jsonData={JSON.stringify(nodeData?.inputs)}
        label="Inputs"
        className="mb-5 mt-1.5"
      />
      <STJsonViewer jsonData={JSON.stringify(nodeData?.outputs)} label="Outputs" />
    </DCPTabsContent>
  );
};

export default StandardTestContent;
