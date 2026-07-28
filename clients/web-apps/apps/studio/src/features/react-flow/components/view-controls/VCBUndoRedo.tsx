import { cn } from "@avplatform/ui/lib";
import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { Separator } from "@avplatform/ui";
import { Undo2, Redo2 } from "lucide-react";
import { VCBContainer } from "./VCBContainer";
import { useUndoRedoControls } from "@/hooks/useUndoRedoControls";

/**
 * Renders the Undo and Redo actions for the ReactFlow ViewControls panel.
 *
 * @returns {JSX.Element} The rendered VCBUndoRedo component.
 */
export const VCBUndoRedo = () => {
  const { undo, redo, canUndo, canRedo } = useUndoRedoControls();

  return (
    <VCBContainer>
      {/* Undo Button */}
      <Tooltip content="Undo" side="right">
        <Button
          size="icon6"
          className={cn("rounded-md")}
          variant={"ghost"}
          onClick={() => undo()}
          disabled={!canUndo}
        >
          <Undo2 className="h-4 w-4 text-[--icon-color]" />
        </Button>
      </Tooltip>

      {/* Separator between Undo and Redo */}
      <Separator orientation="horizontal" className="my-1 h-[0.5px]" />

      {/* Redo Button */}
      <Tooltip content="Redo" side="right">
        <Button
          size="icon6"
          className={cn("rounded-md")}
          variant={"ghost"}
          onClick={() => redo()}
          disabled={!canRedo}
        >
          <Redo2 className="h-4 w-4 text-[--icon-color]" />
        </Button>
      </Tooltip>
    </VCBContainer>
  );
};
