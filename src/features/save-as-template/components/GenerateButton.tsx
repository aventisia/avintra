import { Button } from "@aventisia/ui/buttons";
import { SparklesIcon } from "lucide-react";
import { useGenerateDescriptionMutation } from "../hooks/useGenerateDescriptionMutation";
import { getPromptDataFromNodes } from "../utils/getPromtDataFormNodes";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useShallow } from "zustand/react/shallow";
import { Node } from "@xyflow/react";
import { NodeDataType } from "@/types/node-data-type";
import { UseFormSetValue } from "react-hook-form";
import { z } from "zod";
import { saveAsTemplateSchema } from "../constants/save-as-template-zod-schema";
import { cn } from "@aventisia/ui/lib";
import { useEffect } from "react";

const GenerateButton = ({
  setVal,
}: {
  setVal: UseFormSetValue<z.infer<typeof saveAsTemplateSchema>>;
}) => {
  // Get nodes from the react flow store
  const { nodes } = useReactFlowExtStore(
    useShallow((state) => ({ nodes: state.nodes })),
  );

  // Mutation hook to generate the template description
  const { mutate, data, isPending, isSuccess } =
    useGenerateDescriptionMutation();

  // Update the form value 'description' whenever new data is returned from the mutation
  useEffect(() => {
    if (data?.data) {
      setVal("description", data.data);
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
        mutate(
          JSON.stringify(getPromptDataFromNodes(nodes as Node<NodeDataType>[])),
        );
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
