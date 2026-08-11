import { IS_TAURI } from "@avplatform/ui/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  SimpleDDMenuItem,
} from "@avplatform/ui/dropdown-menu";
import { toast } from "@avplatform/ui/sonner";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowLeftRightIcon,
  BookCopyIcon,
  DockIcon,
  ImportIcon,
  KeyboardIcon,
  LockOpenIcon,
  UploadIcon,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useInputOutputsStore } from "@/features/add-input-output/stores/inputs-outputs-store";
import { ExecutionLogsTrigger } from "@/features/execution-logs/components/execution-log-panel/ExecutionLogsTrigger";
import { useImportStore } from "@/features/import-flow/stores/import-flow-store";
import { useKeyboardShortcutsStore } from "@/features/keyboard-shortcuts/stores/keyboard-shortcuts-store";
import { PublishFlow } from "@/features/publish-flow/PublishFlow";
import { useSaveAsTemplateStore } from "@/features/save-as-template/stores/save-as-template-store";
import { useExportFlow } from "@/hooks/useExportFlow";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { HeaderActionMenuTrigger } from "./HeaderActionMenuTrigger";

export const HeaderActionMenu: React.FC = () => {
  const { setShowDialog: setExportDialog } = useInputOutputsStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );

  const { setUpload } = useImportStore(
    useShallow((state) => ({
      setUpload: state.setUpload,
    })),
  );

  const { setShowDialog: keyboardDialog } = useKeyboardShortcutsStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );

  // Get state and actions from the  store
  const { setShowDialog: setSATDialog } = useSaveAsTemplateStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );

  const { exportFlow, exportFlowTrimmed } = useExportFlow();

  const { isChatAgent } = useCurrentFlowStore(
    useShallow((state) => ({
      isChatAgent: state.isChatAgent,
    })),
  );

  // Tauri API to open the UI inspector
  const openUIInspector = async () => {
    try {
      // Get websocket port
      const wsPort = await invoke("get_websocket_port");

      // Call the Tauri command to launch the UI inspector
      await invoke("launch_ui_inspector", {
        wsPort,
      });
    } catch (error) {
      // Inform the user about the failure
      toast.error(`Failed to launch the UI Inspector. Please try again. ${error}`);
    }
  };

  // Return the component
  return (
    // Header actions menu
    <DropdownMenu>
      {/* Header actions trigger */}
      <HeaderActionMenuTrigger />

      {/* Header actions menu content */}
      <DropdownMenuContent align="end" className="mt-0 flex w-fit min-w-[12rem] flex-col mlg:mt-4">
        {/* <FlowLogHeader /> */}
        <ExecutionLogsTrigger />

        {IS_TAURI && !isChatAgent ? (
          <SimpleDDMenuItem
            size="md"
            Icon={ArrowTopRightOnSquareIcon}
            content="Open UI Inspector"
            onClick={openUIInspector}
          />
        ) : null}

        <SimpleDDMenuItem
          size="md"
          Icon={ImportIcon}
          content="Import"
          onClick={() => {
            setUpload(true);
          }}
        />

        <SimpleDDMenuItem
          size="md"
          Icon={UploadIcon}
          content="Export"
          onClick={() => {
            exportFlow();
          }}
        />

        <SimpleDDMenuItem
          size="md"
          Icon={BookCopyIcon}
          content="Save As Template"
          onClick={() => setSATDialog(true)}
        />

        {!isChatAgent ? (
          <SimpleDDMenuItem
            onClick={() => setExportDialog(true)}
            size="md"
            Icon={ArrowLeftRightIcon}
            content="Add Input/Output"
          />
        ) : null}

        <SimpleDDMenuItem
          size="md"
          Icon={KeyboardIcon}
          content="Keyboard Shortcuts"
          onClick={() => {
            keyboardDialog(true);
          }}
        />

        {import.meta.env.MODE !== "production" ? (
          <>
            <SimpleDDMenuItem
              size="md"
              Icon={UploadIcon}
              content="Export (Trimmed)"
              onClick={() => {
                exportFlowTrimmed();
              }}
            />

            <SimpleDDMenuItem size="md" Icon={LockOpenIcon} content="Lock" />
            <SimpleDDMenuItem size="md" Icon={DockIcon} content="Archive" />
          </>
        ) : null}
        <DropdownMenuSeparator className="my-1" />
        <PublishFlow />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
