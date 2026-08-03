import { Button } from "@avplatform/ui/buttons";
import { FlowTypesEnum } from "@avplatform/ui/enums";
import { cn } from "@avplatform/ui/lib";
import { Node } from "@xyflow/react";
import { SparklesIcon } from "lucide-react";
import { useEffect } from "react";
import { UseFormSetValue } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";

import { saveAsTemplateSchema } from "../constants/save-as-template-zod-schema";
import { useGenerateInstructionMutation } from "../hooks/useGenerateInstructionMutation";
import { getPromptDataFromNodes } from "../utils/getPromtDataFormNodes";

const GenerateButton = ({
  setVal,
}: {
  setVal: UseFormSetValue<z.infer<typeof saveAsTemplateSchema>>;
}) => {
  // Get nodes from the react flow store
  const { nodes } = useReactFlowExtStore(useShallow((state) => ({ nodes: state.nodes })));

  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  // Mutation hook to generate the template instruction
  const { mutate, data, isPending, isSuccess } = useGenerateInstructionMutation();

  // Update the form value 'instruction' whenever new data is returned from the mutation
  useEffect(() => {
    if (data?.data) {
      setVal("instruction", data.data);
    }
  }, [data?.data]);

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "flex items-center gap-2 border-primary text-primary transition-all duration-200 hover:bg-primary hover:text-white",
        isPending && "cursor-wait",
      )}
      type="button"
      disabled={isPending}
      onClick={() => {
        // Trigger mutation with serialized prompt data extracted from nodes
        mutate({
          refType: FlowTypesEnum.Agent, // Agent, ChatAgent, Block all comes under Agent umbrella
          refId: currentFlow.versionId,
          refName: currentFlow.name,
          payload: JSON.stringify(getPromptDataFromNodes(nodes as Node<NodeDataType>[])),
        });
      }}
    >
      {/* Icon with pulse animation while generating */}
      <SparklesIcon className={cn("h-4 w-4", isPending && "animate-pulse")} />

      {/* Button text changes based on mutation state */}
      {isPending ? "Generating..." : isSuccess ? "Generated!" : "Generate"}
    </Button>
  );
};

export default GenerateButton;
