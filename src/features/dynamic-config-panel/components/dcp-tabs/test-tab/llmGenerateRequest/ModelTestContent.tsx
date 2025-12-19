import ExecuteButton from "./ExecuteButton";
import { DCPTabsContent } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsContent";
import { JsonViewer } from "@/components/json-viewer/JsonViewer";

const ModelTestContent = () => {
  return (
    <DCPTabsContent tabValue="Test" footer={<ExecuteButton />}>
      <div className="border-dividers overflow-hidden rounded-lg border border-solid">
        <JsonViewer jsonData="" className="h-[calc(60vh)]" enableCopy />
      </div>
    </DCPTabsContent>
  );
};

export default ModelTestContent;
