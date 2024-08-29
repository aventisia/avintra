import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/react-toolkit/ui/context-menu";
import { DeleteCMItem } from "@/react-toolkit/ui/context-menu/DeleteCMItem";
import { SimpleCMItem } from "@/react-toolkit/ui/context-menu/SimpleCMItem";
import { Clipboard, Copy, Library, Scissors } from "lucide-react";

export const ReactFlowContextMenu = ({ children }: React.PropsWithChildren) => {
  // Auto layout the flow
  const autoLayout = useDagreAutoLayout();

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-40">
        {/* Cut selection */}
        <SimpleCMItem
          size="sm"
          content="Cut"
          Icon={Scissors}
          shortCut="Ctrl+X"
        />

        {/* Copy selection */}
        <SimpleCMItem size="sm" content="Copy" Icon={Copy} shortCut="Ctrl+C" />

        {/* Paste cut or copied items */}
        <SimpleCMItem
          size="sm"
          content="Paste"
          Icon={Clipboard}
          shortCut="Ctrl+V"
        />

        <ContextMenuSeparator className="h-[0.5px]" />

        {/* Organize items. Apply auto layout */}
        <SimpleCMItem
          size="sm"
          content="Organize"
          Icon={Library}
          onClick={() => autoLayout()}
        />

        <ContextMenuSeparator className="h-[0.5px]" />

        {/* Delete selected items */}
        <DeleteCMItem size="sm" />
      </ContextMenuContent>
    </ContextMenu>
  );
};
