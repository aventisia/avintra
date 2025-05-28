import { FlowVersions } from "@/features/flow-versions/components";
import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { DotSeparator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { ArrowLeftIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

const LeftHeaderSection = () => {
  // Get global store state and actions
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      isFlowSaving: state.isFlowSaving,
    })),
  );

  return (
    <div className="flex flex-grow items-center gap-2">
      <a
        href={import.meta.env.VITE_WORKSPACE_URL}
        className="flex items-center justify-center gap-2 font-medium"
      >
        <Button variant="ghost" size={"icon8"} className="hover:bg-white/10">
          <ArrowLeftIcon className="h-5 w-5 text-primary-foreground" />
        </Button>
      </a>
      <AppLogo className="h-5 text-sm font-bold" />{" "}
      <DotSeparator className="mx-[0.1rem]" />
      {/* flow name */}
      <span className="truncate text-base font-bold text-primary-foreground">
        {currentFlow.name || "Flow Name"}
      </span>
      <FlowVersions />
    </div>
  );
};

export default LeftHeaderSection;
