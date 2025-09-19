import { IS_TAURI } from "@/constants";
import { useFlowExecutionLogStore } from "@/features/flow-execution-log/stores/flow-execution-lof-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  SimpleDDMenuItem,
} from "@aventisia/ui/dropdown-menu";
import { toast } from "@aventisia/ui/sonner";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowLeftRightIcon,
  BookCopyIcon,
  DockIcon,
  DownloadIcon,
  KeyboardIcon,
  LockOpenIcon,
  LogsIcon,
  UploadIcon,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { HeaderActionMenuTrigger } from "./HeaderActionMenuTrigger";
import { useInputOutputsStore } from "@/features/add-input-output/stores/inputs-outputs-store";
import { useSaveAsTemplateStore } from "@/features/save-as-template/stores/save-as-template-store";
import { useExportFlow } from "@/hooks/useExportFlow";

export const HeaderActionMenu: React.FC = () => {
  // Get flow execution store state & actions
  const { setShowDialog } = useFlowExecutionLogStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );

  const { setShowDialog: setExportDialog } = useInputOutputsStore(
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

  // Tauri API to open the UI inspector
  const openUIInspector = async () => {
    try {
      // Get websocket port
      const wsPort = await invoke("get_websocket_port");

      // Call the Tauri command to launch the UI inspector
      const res = await invoke("launch_ui_inspector", {
        wsPort,
      });
      console.log(res);
    } catch (error) {
      // Inform the user about the failure
      toast.error(
        `Failed to launch the UI Inspector. Please try again. ${error}`,
      );
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
        className="mt-0 w-[13rem] min-w-[13rem] mlg:mt-4"
      >
        {/* <FlowLogHeader /> */}
        <SimpleDDMenuItem
          size="md"
          Icon={LogsIcon}
          content="Execution Logs"
          onClick={() => setShowDialog(true)}
        />

        {/* <Save As Template /> */}
        <SimpleDDMenuItem
          size="md"
          Icon={BookCopyIcon}
          content="Save As Template"
          onClick={() => setSATDialog(true)}
        />

        {IS_TAURI ? (
          <SimpleDDMenuItem
            size="md"
            Icon={ArrowTopRightOnSquareIcon}
            content="Open UI Inspector"
            onClick={openUIInspector}
          />
        ) : null}
        {!IS_TAURI ? (
          <SimpleDDMenuItem
            size="md"
            Icon={DownloadIcon}
            content="Download Desktop App"
            onClick={() => {
              window.open(
                `${import.meta.env.VITE_ACCOUNTS_API_URL}/desktop-app/download/`,
                "_blank",
              );
            }}
          />
        ) : null}
        {import.meta.env.MODE !== "production" ? (
          <>
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
              Icon={UploadIcon}
              content="Export (Trimmed)"
              onClick={() => {
                exportFlowTrimmed();
              }}
            />
            <DropdownMenuSeparator />

            <SimpleDDMenuItem
              onClick={() => setExportDialog(true)}
              size="md"
              Icon={ArrowLeftRightIcon}
              content="Add Input/Output"
            />
            {/* DropdownMenuSeparator component */}
            <DropdownMenuSeparator />
            <SimpleDDMenuItem size="md" Icon={LockOpenIcon} content="Lock" />
            <SimpleDDMenuItem size="md" Icon={DockIcon} content="Archive" />
            {/* DropdownMenuSeparator component */}
            <DropdownMenuSeparator />
            <SimpleDDMenuItem
              size="md"
              Icon={KeyboardIcon}
              content="Keyboard Shortcuts"
            />
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
