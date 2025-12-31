/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGenerateInstructionMutation } from "@/features/save-as-template/hooks/useGenerateInstructionMutation";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { SparklesIcon } from "lucide-react";
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

const ImproveWithAIButton = ({
  form,
}: {
  form: UseFormReturn<
    {
      [x: string]: any;
    },
    any,
    undefined
  >;
}) => {
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  // Mutation hook to generate the template instruction
  const {
    mutate: improveWithAI,
    data,
    isPending,
  } = useGenerateInstructionMutation();

  useEffect(() => {
    if (data?.data) {
      form.setValue("prompt", data?.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.data]);

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={form.watch("input") == ""}
      className={cn(
        "flex items-center gap-2 rounded-full border-primary text-primary transition-all duration-200 hover:bg-primary hover:text-white",
        isPending && "cursor-wait",
      )}
      type="button"
      onClick={() => {
        if (!isPending)
          // Trigger mutation with serialized prompt data extracted from nodes
          improveWithAI({
            refType: "Platform",
            refId: currentFlow.versionId,
            refName: currentFlow.name,
            payload: form.getValues("input"),
          });
      }}
    >
      {/* Icon with pulse animation while generating */}
      <SparklesIcon className={cn("h-4 w-4", isPending && "animate-pulse")} />
      Improve with AI
    </Button>
  );
};

export default ImproveWithAIButton;
