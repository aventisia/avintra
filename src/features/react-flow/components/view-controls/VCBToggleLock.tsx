import { Button, Tooltip } from "@/react-toolkit/components/ui";
import { cn } from "@/react-toolkit/lib";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";
import { useReactFlowExtStore } from "@/stores";

/**
 * Renders a lock/unlock button for the ReactFlowExt component. (VCB=View Control Button)
 */
export const VCBToggleLock = () => {
  // Get ReactFlowExt store state & actions
  const { isLocked, toggleIsLocked } = useReactFlowExtStore(
    useShallow((state) => ({
      isLocked: state.isLocked,
      toggleIsLocked: state.toggleIsLocked,
    })),
  );

  // Render Lock/Unlock button
  return (
    <Tooltip content={isLocked ? "Unlock" : "Lock"}>
      <Button
        size="icon6"
        className={cn("rounded-md")}
        variant={"ghost"}
        onClick={() => toggleIsLocked(!isLocked)}
      >
        {isLocked ? (
          <LockClosedIcon className="h-4 w-4 text-[--icon-color]" />
        ) : (
          <LockOpenIcon className="h-4 w-4 text-[--icon-color]" />
        )}
      </Button>
    </Tooltip>
  );
};
