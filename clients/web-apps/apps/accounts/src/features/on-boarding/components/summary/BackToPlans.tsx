import { Button } from "@avplatform/ui/buttons";
import { ArrowLeft } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useChoosePlanStore } from "../../stores/choose-plan-store";

export const BackToPlans = () => {
  // Get store state and actions
  const { setStepNo } = useChoosePlanStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
    })),
  );

  return (
    <div className="w-full overflow-hidden mb-2">
      <div className="flex items-center gap-2">
        <Button onClick={() => setStepNo(2)} variant={"ghost"} className="p-1.5" size={"icon9"}>
          <ArrowLeft className="mt-[2px] h-5 w-5" />
        </Button>
        <h1 className="text-title text-ink">Summary</h1>
      </div>
    </div>
  );
};
