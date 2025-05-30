import {
  DropdownMenu,
  DropdownMenuSeparator,
  SimpleDDMenuItem,
} from "@aventisia/ui/dropdown-menu";
import { DropdownMenuContent } from "@aventisia/ui/dropdown-menu";
import { HeaderActionMenuTrigger } from "./HeaderActionMenuTrigger";
import { DockIcon, KeyboardIcon, LockOpenIcon, UploadIcon } from "lucide-react";
import FlowLogHeader from "@/features/flow-logs/components/FlowLogHeader";

export const HeaderActionMenu: React.FC = () => {
  // Return the component
  return (
    // Header actions menu
    <DropdownMenu>
      {/* Header actions trigger */}
      <HeaderActionMenuTrigger />

      {/* Header actions menu content */}
      <DropdownMenuContent align="end" className="mt-2 w-[12rem] min-w-[12rem]">
        <FlowLogHeader />
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
