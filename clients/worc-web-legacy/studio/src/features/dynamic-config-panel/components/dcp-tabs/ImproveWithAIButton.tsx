/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { SparklesIcon } from "lucide-react";
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";
import { useImproveWithAIMutation } from "../../hooks/useImproveWithAIMutation";
import { getAITasksByName } from "@/features/ai-tasks/apis/ai-tasks-apis";
import { LLMResponseDto, ProviderLiteral } from "../../dtos/llm-providers-dto";
import { LoadingSpinner } from "@aventisia/ui";

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
  const { mutate: improveWithAI, data, isPending } = useImproveWithAIMutation();

  useEffect(() => {
    if (data) {
      const improvedPrompt = data as unknown as LLMResponseDto;
      form.setValue("prompt", improvedPrompt?.output);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleImproveWithAI = async () => {
    if (isPending) return;

    try {
      const res = await getAITasksByName("ImproveWithAI");

      if (!res?.data) {
        console.warn("ImproveWithAI task not found");
        return;
      }

      const {
        modelProvider,
        model,
        systemInput,
        userInput,
        isJsonOutput,
        maxOutputTokens,
        temperature,
        topP,
      } = res.data;

      const userPrompt = form.getValues("prompt") ?? "";

      improveWithAI({
        provider: (modelProvider ?? "") as ProviderLiteral,
        model: model ?? "",
        input: [
          {
            role: "system",
            content: systemInput ?? "",
          },
          {
            role: "user",
            content: (userInput ?? "").replace("{{userText}}", userPrompt),
          },
        ],
        is_json_output: Boolean(isJsonOutput),
        max_output_tokens: maxOutputTokens ?? undefined,
        is_byok_enabled: false,
        credential_id: null,
        temperature: temperature ?? 0.7,
        top_p: topP ?? 1,
        stream: false,
        ref_id: currentFlow.id,
        ref_name: currentFlow.name,
        ref_type: "Agent",
        action: "AgentExecution",
      });
    } catch (error) {
      console.error("ImproveWithAI failed:", error);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      type="button"
      disabled={isPending || !form.watch("prompt")}
      className={cn(
        "flex w-36 items-center gap-2 rounded-full border-primary text-primary transition-all duration-200",
        isPending ? "cursor-wait" : "hover:bg-primary hover:text-white",
      )}
      onClick={handleImproveWithAI}
    >
      {isPending ? (
        <>
          <LoadingSpinner className="h-4 w-4 animate-spin" />
          Improving…
        </>
      ) : (
        <>
          <SparklesIcon className="h-4 w-4" />
          Improve with AI
        </>
      )}
    </Button>
  );
};

export default ImproveWithAIButton;
