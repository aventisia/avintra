import { IS_TAURI } from "@avplatform/ui/constants";
import { DropdownMenu, DropdownMenuContent, SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { toast } from "@avplatform/ui/sonner";
import {
  AppWindowIcon,
  ArrowSquareInIcon,
  ArrowSquareOutIcon,
  ArrowsLeftRightIcon,
  BooksIcon,
  GearIcon,
  KeyboardIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
  SlidersHorizontalIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { invoke } from "@tauri-apps/api/core";
import { useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { usePanelStore } from "@/components/panel/stores/panel-store";
import { useInputOutputsStore } from "@/features/add-input-output/stores/inputs-outputs-store";
import { useDirtyNodeConfigGuard } from "@/features/dynamic-config-panel/hooks/useDirtyNodeConfigGuard";
import { ExecutionLogsTrigger } from "@/features/execution-logs/components/execution-log-panel/ExecutionLogsTrigger";
import { PANEL_ID as SETTINGS_PANEL_ID } from "@/features/flow-settings/constants";
import { useImportStore } from "@/features/import-flow/stores/import-flow-store";
import { useKeyboardShortcutsStore } from "@/features/keyboard-shortcuts/stores/keyboard-shortcuts-store";
import { useSaveAsTemplateStore } from "@/features/save-as-template/stores/save-as-template-store";
import { useSearchStore } from "@/features/search/stores/serach-store";
import { useExportFlow } from "@/hooks/useExportFlow.hook";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { HeaderActionMenuTrigger } from "./HeaderActionMenuTrigger";

type HeaderActionMenuProps = {
  /** Shows the Preferences item; the header owns the popover it opens. */
  onOpenPreferences?: () => void;
};

export const HeaderActionMenu = ({ onOpenPreferences }: HeaderActionMenuProps) => {
  const setSearchOpen = useSearchStore((state) => state.setShowDialog);
  const openPanel = usePanelStore((state) => state.openPanel);
  const afterCloseRef = useRef<() => void>();

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
      <DropdownMenuContent
        align="end"
        className="mt-0 flex w-fit min-w-[12rem] flex-col mlg:mt-4"
        // IMPORTANT NOTE: the menu traps focus until it fully closes, so the preferences popover opens only after that
        onCloseAutoFocus={(e) => {
          if (!afterCloseRef.current) return;
          e.preventDefault();
          afterCloseRef.current();
          afterCloseRef.current = undefined;
        }}
      >
        {!isChatAgent ? (
          <SimpleDDMenuItem
            size="md"
            Icon={MagnifyingGlassIcon}
            content="Search"
            onClick={() => setSearchOpen(true)}
          />
        ) : null}

        {!isChatAgent && import.meta.env.MODE !== "production" ? (
          <SimpleDDMenuItem
            size="md"
            Icon={GearIcon}
            content="Settings"
            onClick={() => openPanel(SETTINGS_PANEL_ID, "right")}
          />
        ) : null}

        {onOpenPreferences ? (
          <SimpleDDMenuItem
            size="md"
            Icon={SlidersHorizontalIcon}
            content="Preferences"
            onClick={() => (afterCloseRef.current = onOpenPreferences)}
          />
        ) : null}

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
