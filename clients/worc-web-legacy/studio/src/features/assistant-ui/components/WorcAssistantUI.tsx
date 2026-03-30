import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import {
  AssistantRuntimeProvider,
  //ComposerPrimitive,
  //ThreadPrimitive,
  useLocalRuntime,
} from "@assistant-ui/react";
// import { Button } from "@aventisia/ui/buttons";
// import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
// import { SparklesIcon } from "lucide-react";
import { Node } from "@xyflow/react";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  LLMProviderType,
  //MessageBubble,
  createAssistantUIModelAdapter,
} from "..";
import { loadPolicyDocuments } from "../utils/load-policy-documents";
// import { ThreadList } from "./thread-list";
import { Thread } from "./thread";

const POLICY_CONTEXT = loadPolicyDocuments();

type WorcAssistantUIProps = {
  provider?: LLMProviderType;
  model?: string;
};

const TARGET_NODE_NAME = "CreateInferencingAIAgent";
const TARGET_PROMPT_KEY = "__Prompt__Inferencing";

type NodeInputLike = {
  key?: string;
  value?: unknown;
};

const getSystemPromptFromFlowNodes = (nodes: Node[]): string => {
  const inferencingNode = nodes.find(
    (node) =>
      node.data &&
      typeof node.data === "object" &&
      "name" in node.data &&
      node.data.name === TARGET_NODE_NAME,
  );

  if (!inferencingNode?.data || !("inputs" in inferencingNode.data)) {
    return "";
  }

  const inputs = inferencingNode.data.inputs;
  if (!Array.isArray(inputs)) {
    return "";
  }

  const promptInput = (inputs as NodeInputLike[]).find(
    (input) => input?.key === TARGET_PROMPT_KEY,
  );

  return typeof promptInput?.value === "string" ? promptInput.value.trim() : "";
};

/**
 * Worc Assistant UI test surface for ChatAgent flows.
 *
 * Responsibilities:
 * 1. Reads active flow metadata from store.
 * 2. Creates an assistant-ui runtime bound to provider/model + flow context.
 * 3. Renders thread history and input composer for streaming chat testing.
 */
export const WorcAssistantUI = ({
  provider = "openai",
  model = "gpt-4o-mini",
}: WorcAssistantUIProps) => {
  // Access current flow details for model adapter metadata.
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({ currentFlow: state.currentFlow })),
  );

  const { nodes } = useReactFlowExtStore(
    useShallow((state) => ({ nodes: state.nodes })),
  );

  const systemPrompt = useMemo(
    () => getSystemPromptFromFlowNodes(nodes),
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
          systemPrompt,
          policyContext: POLICY_CONTEXT,
        }),
      [provider, model, currentFlow.versionId, currentFlow.name, systemPrompt],
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
