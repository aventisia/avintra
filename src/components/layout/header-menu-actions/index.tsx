import { useTauriStore } from "@/stores/tauri-store";
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
  DockIcon,
  DownloadIcon,
  KeyboardIcon,
  LockOpenIcon,
  LogsIcon,
  UploadIcon,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { HeaderActionMenuTrigger } from "./HeaderActionMenuTrigger";
import { useFlowExecutionLogStore } from "@/features/flow-execution-log/stores/flow-execution-lof-store";

export const HeaderActionMenu: React.FC = () => {
  // Get the state if app is open in tauri window
  const { isTauri } = useTauriStore(
    useShallow((state) => ({
      isTauri: state.isTauri,
    })),
  );

  // Get flow execution store state & actions
  const { setShowDialog } = useFlowExecutionLogStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );

  // Tauri API to open the UI inspector
  const openUIInspector = async () => {
    try {
      // Call the Tauri command to launch the UI inspector
      await invoke("launch_ui_inspector")
        .then((res) => console.log(res))
        .catch((e) => console.error(e));
    } catch (error) {
      // Inform the user about the failure
      toast.error("Failed to launch the UI Inspector. Please try again.");
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

        {isTauri ? (
          <SimpleDDMenuItem
            size="md"
            Icon={ArrowTopRightOnSquareIcon}
            content="Open UI Inspector"
            onClick={openUIInspector}
          />
        ) : null}
        {!isTauri ? (
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
        <SimpleDDMenuItem size="md" Icon={UploadIcon} content="Export" />

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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
