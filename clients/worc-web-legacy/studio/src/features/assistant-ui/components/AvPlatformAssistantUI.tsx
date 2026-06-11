import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import {
  AssistantRuntimeProvider,
  SuggestionAdapter,
  Suggestions,
  ThreadSuggestion,
  useAui,
  useLocalRuntime,
} from "@assistant-ui/react";
import { toast } from "@aventisia/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Node } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  LLMProviderType,
  LLMRequestDto,
  createAssistantUIModelAdapter,
} from "..";
import { AC_QUERY_KEY } from "../../available-credits/available-credits-constants";
import { Thread } from "./thread";

type AvPlatformAssistantUIProps = {
  provider?: LLMProviderType;
  model?: string;
};

const TARGET_NODE_NAME = "CreateConversationAIAgent";

const INPUT_KEYS = {
  PROMPT: "__Prompt__",
  MODEL_CONFIG: "__ModelConfig__",
  TOOLS_CONFIG: "__ToolsConfig__",
  KB_CONFIG: "__KbConfig__",
  RecommendActions: "RecommendActions",
} as const;

type RecommendActions = {
  DefaultActions: string[];
  EnableDynamicActions: boolean;
};

type NodeInputLike = {
  key?: string;
  value?: unknown;
};

type ModelConfigInput = {
  provider?: LLMProviderType;
  model?: string;
  credential_id?: string | null;
  is_byok_enabled?: boolean;
  temperature?: number;
  top_p?: number;
  is_json_output?: boolean;
  max_output_tokens?: number | null;
};

type KBConfigInput = {
  knowledgeBase?: string[];
  numberOfChunks?: number;
};

const getInputValue = <T,>(
  inputs: NodeInputLike[],
  key: string,
): T | undefined => {
  const match = inputs.find((input) => input?.key?.includes(key));

  return match?.value as T | undefined;
};

const getAgentConfigFromFlowNodes = (
  nodes: Node[],
): { payload?: Partial<LLMRequestDto>; actions?: RecommendActions } => {
  const inferencingNode = nodes.find(
    (node) =>
      node.data &&
      typeof node.data === "object" &&
      "name" in node.data &&
      node.data.name === TARGET_NODE_NAME,
  );

  if (!inferencingNode?.data || !("inputs" in inferencingNode.data)) {
    return {};
  }

  const inputs = inferencingNode.data.inputs;

  if (!Array.isArray(inputs)) {
    return {};
  }

  const nodeInputs = inputs as NodeInputLike[];

  const prompt = getInputValue<string>(nodeInputs, INPUT_KEYS.PROMPT);

  const modelConfig = getInputValue<ModelConfigInput>(
    nodeInputs,
    INPUT_KEYS.MODEL_CONFIG,
  );

  const tools = getInputValue<LLMRequestDto["tool_config"]>(
    nodeInputs,
    INPUT_KEYS.TOOLS_CONFIG,
  );

  const kbConfig = getInputValue<KBConfigInput>(
    nodeInputs,
    INPUT_KEYS.KB_CONFIG,
  );
  const actionsConfig = getInputValue<RecommendActions>(
    nodeInputs,
    INPUT_KEYS.RecommendActions,
  );

  return {
    payload: {
      provider: modelConfig?.provider,
      model: modelConfig?.model,
      credential_id: modelConfig?.credential_id ?? null,
      is_byok_enabled: modelConfig?.is_byok_enabled ?? false,
      temperature: modelConfig?.temperature ?? 1,
      top_p: modelConfig?.top_p ?? 1,
      is_json_output: modelConfig?.is_json_output ?? false,
      max_output_tokens: modelConfig?.max_output_tokens ?? null,
      tool_config: tools ?? [],
      kb_names: kbConfig?.knowledgeBase ?? [],
      top_k: kbConfig?.numberOfChunks ?? 5,
      agent_name: TARGET_NODE_NAME,
      input: typeof prompt === "string" ? prompt.trim() : "",
    },
    actions: actionsConfig,
  };
};

/**
 * avplatform Assistant UI test surface for ChatAgent flows.
 *
 * Responsibilities:
 * 1. Reads active flow metadata from store.
 * 2. Creates an assistant-ui runtime bound to provider/model + flow context.
 * 3. Renders thread history and input composer for streaming chat testing.
 */
export const AvPlatformAssistantUI = ({
  provider = "openai",
  model = "gpt-4o-mini",
}: AvPlatformAssistantUIProps) => {
  const queryClient = useQueryClient();

  // Access current flow details for model adapter metadata.
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  const { nodes } = useReactFlowExtStore(
    useShallow((state) => ({ nodes: state.nodes })),
  );

  const hasChatAiNode = useMemo(
    () => nodes?.some((n) => n?.data?.name === TARGET_NODE_NAME),
    [nodes],
  );

  const agentConfig = useMemo(
    () => getAgentConfigFromFlowNodes(nodes),
    [nodes],
  );

  const dynamicSuggestionsRef = useRef<string[]>([]);

  const handleSuggestionsUpdate = useCallback((actions: string[]) => {
    dynamicSuggestionsRef.current = Array.isArray(actions) ? actions : [];
  }, []);

  const suggestionAdapter: SuggestionAdapter = useMemo(
    () => ({
      async generate() {
        const items = dynamicSuggestionsRef.current ?? [];
        const suggestions: ThreadSuggestion[] = items.map((prompt) => ({
          prompt,
        }));
        return suggestions;
      },
    }),
    [],
  );

  // Create a memoized Assistant UI runtime adapter for the specified model and flow context.
  const runtime = useLocalRuntime(
    useMemo(
      () =>
        // Adapter bridges assistant-ui events to the llm stream API contract.
        createAssistantUIModelAdapter({
          provider,
          model,
          flowVersionId: currentFlow.versionId,
          flowName: currentFlow.name,
          agentConfig: agentConfig?.payload,
          onRequestComplete: () => {
            queryClient.invalidateQueries({ queryKey: AC_QUERY_KEY });
          },
          onSuggestionsUpdate: handleSuggestionsUpdate,
        }),
      [
        provider,
        model,
        currentFlow.versionId,
        currentFlow.name,
        agentConfig,
        queryClient,
        handleSuggestionsUpdate,
      ],
    ),
    { adapters: { suggestion: suggestionAdapter } },
  );

  const aui = useAui({
    // initial/static suggestions
    suggestions: Suggestions(agentConfig.actions?.DefaultActions ?? []),
  });

  useEffect(() => {
    if (nodes?.length && !hasChatAiNode) {
      toast.error("At least one Chat AI node is required");
    }
  }, [nodes, hasChatAiNode]);

  if (!hasChatAiNode) return null;

  return (
    <AssistantRuntimeProvider aui={aui} runtime={runtime}>
      <div className="flex h-full flex-col bg-background">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
};
