import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import {
  AssistantRuntimeProvider,
  //ComposerPrimitive,
  //ThreadPrimitive,
  useLocalRuntime,
} from "@assistant-ui/react";
import { useQueryClient } from "@tanstack/react-query";
// import { Button } from "@aventisia/ui/buttons";
// import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
// import { SparklesIcon } from "lucide-react";
import { Node } from "@xyflow/react";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  LLMProviderType,
  LLMRequestDto,
  //MessageBubble,
  createAssistantUIModelAdapter,
} from "..";
import { AC_QUERY_KEY } from "../../available-credits/available-credits-constants";
// import { ThreadList } from "./thread-list";
import { Thread } from "./thread";

type AvPlatformAssistantUIProps = {
  provider?: LLMProviderType;
  model?: string;
};

const TARGET_NODE_NAME = "CreateInferencingAIAgent";

const INPUT_KEYS = {
  PROMPT: "__Prompt__",
  MODEL_CONFIG: "__ModelConfig__",
  TOOLS_CONFIG: "__ToolsConfig__",
  KB_CONFIG: "__KbConfig__",
} as const;

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

const getAgentConfigFromFlowNodes = (nodes: Node[]): Partial<LLMRequestDto> => {
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

  return {
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
  };
};

/**
 * AV Platform Assistant UI test surface for ChatAgent flows.
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
    useShallow((state) => ({ currentFlow: state.currentFlow })),
  );

  const { nodes } = useReactFlowExtStore(
    useShallow((state) => ({ nodes: state.nodes })),
  );

  const agentConfig = useMemo(
    () => getAgentConfigFromFlowNodes(nodes),
    [nodes],
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
          agentConfig,
          onRequestComplete: () => {
            queryClient.invalidateQueries({ queryKey: AC_QUERY_KEY });
          },
        }),
      [
        provider,
        model,
        currentFlow.versionId,
        currentFlow.name,
        agentConfig,
        queryClient,
      ],
    ),
  );

  return (
    // Provides runtime context to all assistant-ui primitives below.
    // <AssistantRuntimeProvider runtime={runtime}>
    //   <ThreadPrimitive.Root className="flex h-full flex-col bg-background">
    //     {/* Header area shows feature context and currently selected model. */}
    //     <div className="border-b border-border px-3.5 py-3">
    //       <div className="flex items-center gap-2 text-base font-medium">
    //         <SparklesIcon className="h-4 w-4 text-primary" />
    //         Test Agent
    //       </div>
    //     </div>

    //     {/* Scrollable message timeline. */}
    //     <ThreadPrimitive.Viewport className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
    //       {/* Empty-state guidance before first message is sent. */}
    //       <ThreadPrimitive.If empty>
    //         <div className="rounded-lg bg-muted/40 h-full gap-2 flex items-center justify-center p-3 text-sm text-muted-foreground">
    //           <ChatBubbleBottomCenterTextIcon className="h-4 w-4" /> Send a
    //           message to test your agent.
    //         </div>
    //       </ThreadPrimitive.If>

    //       {/* Delegates per-message rendering to a reusable bubble component. */}
    //       <ThreadPrimitive.Messages>
    //         {({ message }) => <MessageBubble message={message} />}
    //       </ThreadPrimitive.Messages>
    //     </ThreadPrimitive.Viewport>

    //     {/* Composer area for prompt entry and submit actions. */}
    //     <ComposerPrimitive.Root className="p-3">
    //       <div className="rounded-xl border border-border bg-background p-2 shadow-sm">
    //         <ComposerPrimitive.Input
    //           rows={2}
    //           placeholder="Type your prompt..."
    //           className="w-full resize-none bg-transparent px-1 py-1 text-sm outline-none"
    //           // Press Enter to send quickly; Shift+Enter inserts a new line.
    //           submitMode="enter"
    //         />
    //         <div className="mt-2 flex items-center justify-between">
    //           <span className="text-xs text-muted-foreground">
    //             Enter to send, Shift+Enter for newline
    //           </span>
    //           <ComposerPrimitive.Send asChild>
    //             <Button type="submit" size="sm">
    //               Send
    //             </Button>
    //           </ComposerPrimitive.Send>
    //         </div>
    //       </div>
    //     </ComposerPrimitive.Root>
    //   </ThreadPrimitive.Root>
    // </AssistantRuntimeProvider>

    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-full flex-col bg-background">
        {/* <ThreadList /> */}
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
};
