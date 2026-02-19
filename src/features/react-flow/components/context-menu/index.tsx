import { ContextMenu, ContextMenuTrigger } from "@aventisia/ui/context-menu";
import { ContextMenuContentExt } from "./ContextMenuContentExt";

/**
 * Renders the context menu for the React Flow canvas.
 * Dynamically enables/disables options based on what is currently inside the clipboard
 * and what type of node was right-clicked.
 */
export const ReactFlowContextMenu = ({ children }: React.PropsWithChildren) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContentExt />
    </ContextMenu>
  );
};
