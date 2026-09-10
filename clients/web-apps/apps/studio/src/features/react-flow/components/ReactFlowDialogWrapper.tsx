import { memo } from "react";

import { NodeSelector } from "@/features/action-selector/components";
import AddInputsOutputsDialog from "@/features/add-input-output/components/AddInputsOutputsDialog";
import { FlowBlockCrudDialog } from "@/features/flow-block/components/flow-block-crud-dialog";
import { FlowSettings } from "@/features/flow-settings/components";
import ImportFlow from "@/features/import-flow/components/ImportFlow";
import ShortcutsDialog from "@/features/keyboard-shortcuts/KeyboardShortcutsDialog";
import { SaveAsTemplateDialog } from "@/features/save-as-template/components/SaveAsTemplateDialog";
import { SearchCommandDialog } from "@/features/search/componets";
import ShareAccessDialog from "@/features/share-access/components";

export const ReactFlowDialogWrapper = memo(() => {
  return (
    <>
      <NodeSelector />
      <SearchCommandDialog />
      <ShareAccessDialog />
      <AddInputsOutputsDialog />
      <FlowSettings />
      <FlowBlockCrudDialog />
      <SaveAsTemplateDialog />
      <ShortcutsDialog />
      <ImportFlow />
    </>
  );
});
