import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useEnvironmentStore } from "@/stores/environment-store";

import { useResourceFlowDraft } from "../../hooks/useResourceFlowDraft.hook";
import { useResourceFlowAccessStore } from "../../stores/resource-flow-access.store";
import { ResourceFlowAccessContent } from "./ResourceFlowAccessContent";

type ResourceFlowAccessDialogProps = {
  queryKey: unknown[];
};

const FlowAccessPanel = ({ isOpen, queryKey }: { isOpen: boolean; queryKey: unknown[] }) => {
  const draft = useResourceFlowDraft(queryKey);

  return <ResourceFlowAccessContent isOpen={isOpen} draft={draft} />;
};

/**
 * Dialog assigning agents to a resource. An empty assignment leaves the resource open to
 * every agent; a non-empty one restricts it to exactly the listed agents. Each opening starts
 * from a fresh draft.
 */
const ResourceFlowAccessDialog = ({ queryKey }: ResourceFlowAccessDialogProps) => {
  const isProd = useEnvironmentStore((state) => state.env === "prod");
  const { showDialog, setShowDialog } = useResourceFlowAccessStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );
  const isOpen = showDialog && !isProd;
  const [wasOpen, setWasOpen] = useState(isOpen);
  const [openCount, setOpenCount] = useState(isOpen ? 1 : 0);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setOpenCount((count) => count + 1);
  }

  useEffect(() => {
    if (isProd && showDialog) {
      setShowDialog(false);
    }
  }, [isProd, setShowDialog, showDialog]);

  if (openCount === 0) return null;

  return <FlowAccessPanel key={openCount} isOpen={isOpen} queryKey={queryKey} />;
};

export default ResourceFlowAccessDialog;
