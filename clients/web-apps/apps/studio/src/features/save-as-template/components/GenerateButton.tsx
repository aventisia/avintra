import { UpgradeFeatureButton } from "@avplatform/ui";
import { FlowTypesEnum } from "@avplatform/ui/enums";
import { cn } from "@avplatform/ui/lib";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { SparkleIcon } from "@phosphor-icons/react";
import { Node } from "@xyflow/react";
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

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );
  const isCommunityDeployment = userSession?.deploymentType === "Community";

  // Mutation hook to generate the template instruction
  const { mutate, data, isPending, isSuccess } = useGenerateInstructionMutation();

  // Update the form value 'instruction' whenever new data is returned from the mutation
  useEffect(() => {
    if (data?.data) {
      setVal("instruction", data.data);
    }
  }, [data?.data, setVal]);

  if (isCommunityDeployment) {
    return (
      <UpgradeFeatureButton
        label="Generate"
        icon={<SparkleIcon className="h-4 w-4" />}
        pricingUrl={`${import.meta.env.VITE_MARKETING_URL}/pricing`}
        size="sm"
        className="flex items-center gap-2"
      />
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        mutate({
          refType: FlowTypesEnum.Agent, // Agent, ChatAgent, Block all comes under Agent umbrella
          refId: currentFlow.versionId,
          refName: currentFlow.name,
          payload: JSON.stringify(getPromptDataFromNodes(nodes as Node<NodeDataType>[])),
        });
      }}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-popover px-3 text-[12.5px] font-medium text-ink-2 outline-none ring-1 ring-border transition hover:bg-sunken/80 hover:text-ink focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60",
        isPending && "cursor-wait",
      )}
    >
      <SparkleIcon className={cn("size-3.5 text-primary-text", isPending && "animate-pulse")} />
      {isPending ? "Generating…" : isSuccess ? "Generated" : "Generate with AI"}
    </button>
  );
};

export default GenerateButton;
