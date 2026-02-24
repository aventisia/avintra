import ExecutionLogDialog from "@/features/flow-execution-log/components";
import { SearchCommandDialog } from "@/features/search/componets";
import { FlowSettings } from "@/features/flow-settings/components";
import AddInputsOutputsDialog from "@/features/add-input-output/components/AddInputsOutputsDialog";
import { FlowBlockCrudDialog } from "@/features/flow-block/components/flow-block-crud-dialog";
import ShareAccessDialog from "@/features/share-access/components";
import { SaveAsTemplateDialog } from "@/features/save-as-template/components/SaveAsTemplateDialog";
import ImportFlow from "@/features/import-flow/components/ImportFlow";
import ShortcutsDialog from "@/features/keyboard-shortcuts/KeyboardShortcutsDialog";

import { DCPDialog } from "@/features/dynamic-config-panel";
import { memo } from "react";

export const ReactFlowDialogWrapper = memo(() => {
  return (
    <>
      <ExecutionLogDialog />
      <SearchCommandDialog />
      <ShareAccessDialog />
      <AddInputsOutputsDialog />
      <FlowSettings />
      <FlowBlockCrudDialog />
      <SaveAsTemplateDialog />
      <ShortcutsDialog />
      <DCPDialog />
      <ImportFlow />
    </>
  );
});
