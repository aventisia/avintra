import { IS_TAURI } from "@avplatform/ui/constants";
import { DropdownMenu, DropdownMenuContent, SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { toast } from "@avplatform/ui/sonner";
import {
  ArchiveIcon,
  ArrowSquareInIcon,
  ArrowSquareOutIcon,
  ArrowsLeftRightIcon,
  BooksIcon,
  KeyboardIcon,
  MagnifyingGlassIcon,
  SlidersHorizontalIcon,
  TrayArrowUpIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { invoke } from "@tauri-apps/api/core";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";

import { usePanelStore } from "@/components/panel/stores/panel-store";
import { useInputOutputsStore } from "@/features/add-input-output/stores/inputs-outputs-store";
import { useArchiveAgentAction } from "@/features/archive-agent/hooks/useArchiveAgentAction.hook";
import { useDirtyNodeConfigGuard } from "@/features/dynamic-config-panel/hooks/useDirtyNodeConfigGuard";
import { useImportStore } from "@/features/import-flow/stores/import-flow-store";
import {
  EXPORT_SHORTCUT,
  FIND_NODE_SHORTCUT,
  IMPORT_SHORTCUT,
  KEYBOARD_SHORTCUTS_SHORTCUT,
} from "@/features/keyboard-shortcuts/constants/shortcut-groups.constant";
import { useKeyboardShortcutsStore } from "@/features/keyboard-shortcuts/stores/keyboard-shortcuts-store";
import {
  menuShortcutProps,
  toHotkeyString,
} from "@/features/keyboard-shortcuts/utils/shortcut-menu.util";
import { useSaveAsTemplateStore } from "@/features/save-as-template/stores/save-as-template-store";
import { useSearchStore } from "@/features/search/stores/serach-store";
import { PANEL_ID as STUDIO_PREFERENCES_PANEL_ID } from "@/features/studio-preferences/constants";
import { useExportFlow } from "@/hooks/useExportFlow.hook";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { HeaderActionMenuTrigger } from "./HeaderActionMenuTrigger";

export const HeaderActionMenu = () => {
  const setSearchOpen = useSearchStore((state) => state.setShowDialog);
  const openPanel = usePanelStore((state) => state.openPanel);

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

  const { exportFlow } = useExportFlow();

  const archiveAgent = useArchiveAgentAction();

  // Flush a dirty node-config form before export/template actions read the canvas.
  const guardDirtyNodeConfig = useDirtyNodeConfigGuard();

  const { isChatAgent } = useCurrentFlowStore(
    useShallow((state) => ({
      isChatAgent: state.isChatAgent,
    })),
  );

  // Menu shortcuts are bound here, not on the items, so they work while the menu is closed.
  useHotkeys(toHotkeyString(IMPORT_SHORTCUT), () => setUpload(true), { preventDefault: true }, [
    setUpload,
  ]);

  useHotkeys(
    toHotkeyString(EXPORT_SHORTCUT),
    () => {
      void guardDirtyNodeConfig(exportFlow);
    },
    { preventDefault: true },
    [guardDirtyNodeConfig, exportFlow],
  );

  useHotkeys(
    toHotkeyString(KEYBOARD_SHORTCUTS_SHORTCUT),
    () => keyboardDialog(true),
    { preventDefault: true, enabled: !isChatAgent },
    [keyboardDialog, isChatAgent],
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
        {!isChatAgent ? (
          <SimpleDDMenuItem
            size="md"
            Icon={MagnifyingGlassIcon}
            content="Search"
            {...menuShortcutProps(FIND_NODE_SHORTCUT)}
            onClick={() => setSearchOpen(true)}
          />
        ) : null}

        {!isChatAgent ? (
          <SimpleDDMenuItem
            size="md"
            Icon={SlidersHorizontalIcon}
            content="Preferences"
            onClick={() => openPanel(STUDIO_PREFERENCES_PANEL_ID, "right")}
          />
        ) : null}

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
          {...menuShortcutProps(IMPORT_SHORTCUT)}
          onClick={() => {
            setUpload(true);
          }}
        />

        <SimpleDDMenuItem
          size="md"
          Icon={UploadSimpleIcon}
          content="Export"
          {...menuShortcutProps(EXPORT_SHORTCUT)}
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
            content="Shortcuts"
            {...menuShortcutProps(KEYBOARD_SHORTCUTS_SHORTCUT)}
            onClick={() => {
              keyboardDialog(true);
            }}
          />
        ) : null}

        {import.meta.env.MODE !== "production" && !archiveAgent.isArchived ? (
          <SimpleDDMenuItem
            size="md"
            Icon={ArchiveIcon}
            content="Archive"
            onClick={archiveAgent.requestArchive}
          />
        ) : null}

        {import.meta.env.MODE !== "production" && archiveAgent.isArchived ? (
          <SimpleDDMenuItem
            size="md"
            Icon={TrayArrowUpIcon}
            content="Unarchive"
            onClick={archiveAgent.requestUnarchive}
          />
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
