import { Loader2 } from "lucide-react";

import { SubflowProgressNode } from "@/features/execute-flow/stores/live-execution-store";

/**
 * Small floating popup shown beneath a block/call-agent node while it is running a
 * sub-flow the user has not navigated into. Displays the metadata of the sub-flow-internal
 * node currently being processed so the developer can see progress without opening the
 * sub-flow.
 */
export const SubflowProgressPopup = ({ node }: { node: SubflowProgressNode }) => {
  return (
    <div className="absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-lg border border-blue-200 bg-white p-2.5 shadow-lg">
      <div className="flex items-center gap-2">
        <Loader2 className="size-4 shrink-0 animate-spin text-blue-500" />
        <span className="truncate text-xs font-semibold text-slate-800">{node.nodeName}</span>
      </div>
      <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
        <div className="flex items-start gap-1.5 text-[0.7rem] text-slate-500">
          <span className="shrink-0 font-medium">ID:</span>
          <span className="truncate font-mono">{node.nodeId}</span>
        </div>
      </div>
    </div>
  );
};
