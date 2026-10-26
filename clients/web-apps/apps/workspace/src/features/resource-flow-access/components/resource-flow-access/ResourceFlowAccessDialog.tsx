import { Dialog, DialogPortal, DialogPrimitive } from "@avplatform/ui/dialog";
import { MotionConfig } from "motion/react";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useEnvironmentStore } from "@/stores/environment-store";

import { useResourceFlowDraft } from "../../hooks/useResourceFlowDraft.hook";
import { useResourceFlowAccessStore } from "../../stores/resource-flow-access.store";
import { ResourceFlowAccessContent } from "./ResourceFlowAccessContent";

type ResourceFlowAccessDialogProps = {
  queryKey: unknown[];
};

/**
 * Mounts with the dialog content, so each opening starts from a fresh draft.
 */
const FlowAccessPanel = ({ queryKey }: ResourceFlowAccessDialogProps) => {
  const draft = useResourceFlowDraft(queryKey);

  return <ResourceFlowAccessContent draft={draft} />;
};

/**
 * Dialog assigning agents to a resource. An empty assignment leaves the resource open to
 * every agent; a non-empty one restricts it to exactly the listed agents.
 */
const ResourceFlowAccessDialog = ({ queryKey }: ResourceFlowAccessDialogProps) => {
  const isProd = useEnvironmentStore((state) => state.env === "prod");
  const { showDialog, setShowDialog } = useResourceFlowAccessStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );

  useEffect(() => {
    if (isProd && showDialog) {
      setShowDialog(false);
    }
  }, [isProd, setShowDialog, showDialog]);

  return (
    <Dialog open={showDialog && !isProd} onOpenChange={setShowDialog}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[3px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pb-4 pt-[max(4.5rem,12vh)] outline-none data-[state=closed]:duration-150 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setShowDialog(false);
          }}
        >
          <MotionConfig reducedMotion="user">
            <FlowAccessPanel queryKey={queryKey} />
          </MotionConfig>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default ResourceFlowAccessDialog;
