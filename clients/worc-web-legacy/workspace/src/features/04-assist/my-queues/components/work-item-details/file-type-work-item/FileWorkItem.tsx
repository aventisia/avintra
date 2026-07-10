import { ScrollArea } from "@aventisia/ui/scroll";

import { JsonEditor } from "@/components/json-editor/JsonEditor";
import FileViewer from "@/react-toolkit/features/file-viewer/components/FileViewer";

import WorkflowTimeline from "../email-type-work-item/WorkflowTimeline";

export default function FileWorkItem() {
  const test = {
    direction: "Input",
    type: "password",
    name: "ApiKey",
    label: "API Key",
    description:
      "Enter your secret API key used to authenticate requests to the service.",
    defaultValue: "",
    required: true
  };

  return (
    <div className=" h-full grid gap-3 grid-cols-2">
      <div className="border h-fit rounded-lg">
        <FileViewer />
      </div>
      <ScrollArea className="h-[calc(100vh-4.5rem-var(--header-height)-2*var(--header-padding))] border rounded-lg bg-background p-3">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between px-1 pb-2">
              <h3 className="text-xs font-semibold">Extracted Output</h3>
            </div>

            <JsonEditor value={JSON.stringify(test, null, 2)} />
          </div>
          <WorkflowTimeline />
        </div>
      </ScrollArea>
    </div>
  );
}
