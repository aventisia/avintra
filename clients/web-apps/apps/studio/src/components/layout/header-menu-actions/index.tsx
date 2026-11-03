import { IS_TAURI } from "@avplatform/ui/constants";
import { DropdownMenu, DropdownMenuContent, SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { toast } from "@avplatform/ui/sonner";
import {
  AppWindowIcon,
  ArrowSquareInIcon,
  ArrowSquareOutIcon,
  ArrowsLeftRightIcon,
  BooksIcon,
  KeyboardIcon,
  LockOpenIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { invoke } from "@tauri-apps/api/core";
import { useShallow } from "zustand/react/shallow";

import { useInputOutputsStore } from "@/features/add-input-output/stores/inputs-outputs-store";
import { useDirtyNodeConfigGuard } from "@/features/dynamic-config-panel/hooks/useDirtyNodeConfigGuard";
import { ExecutionLogsTrigger } from "@/features/execution-logs/components/execution-log-panel/ExecutionLogsTrigger";
import { useImportStore } from "@/features/import-flow/stores/import-flow-store";
import { useKeyboardShortcutsStore } from "@/features/keyboard-shortcuts/stores/keyboard-shortcuts-store";
import { useSaveAsTemplateStore } from "@/features/save-as-template/stores/save-as-template-store";
import { useExportFlow } from "@/hooks/useExportFlow.hook";
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

  // Flush a dirty node-config form before export/template actions read the canvas.
  const guardDirtyNodeConfig = useDirtyNodeConfigGuard();

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
            Icon={ArrowSquareOutIcon}
            content="Open UI inspector"
            onClick={openUIInspector}
          />
        ) : null}

        <SimpleDDMenuItem
          size="md"
          Icon={ArrowSquareInIcon}
          content="Import"
          onClick={() => {
            setUpload(true);
          }}
        />

        <SimpleDDMenuItem
          size="md"
          Icon={UploadSimpleIcon}
          content="Export"
          onClick={() => {
            void guardDirtyNodeConfig(exportFlow);
          }}
        />

        <SimpleDDMenuItem
          size="md"
          Icon={BooksIcon}
          content="Save as template"
          onClick={() => void guardDirtyNodeConfig(() => setSATDialog(true))}
        />

        {!isChatAgent ? (
          <SimpleDDMenuItem
            onClick={() => setExportDialog(true)}
            size="md"
            Icon={ArrowsLeftRightIcon}
            content="Add input/output"
          />
        ) : null}

        {!isChatAgent ? (
          <SimpleDDMenuItem
            size="md"
            Icon={KeyboardIcon}
            content="Keyboard shortcuts"
            onClick={() => {
              keyboardDialog(true);
            }}
          />
        ) : null}

        {import.meta.env.MODE !== "production" ? (
          <>
            <SimpleDDMenuItem
              size="md"
              Icon={UploadSimpleIcon}
              content="Export (trimmed)"
              onClick={() => {
                void guardDirtyNodeConfig(exportFlowTrimmed);
              }}
            />

            <SimpleDDMenuItem size="md" Icon={LockOpenIcon} content="Lock" />
            <SimpleDDMenuItem size="md" Icon={AppWindowIcon} content="Archive" />
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
