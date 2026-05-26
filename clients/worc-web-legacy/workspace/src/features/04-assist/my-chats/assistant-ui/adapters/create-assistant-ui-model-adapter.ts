import {
  ChatModelAdapter,
  ThreadMessage,
  ThreadUserMessagePart,
} from "@assistant-ui/react";

import { executeFlowOnWeb } from "../../apis/execute-flow-apis";
import { ExecuteFlowRequestDto } from "../../dtos/execute-flow-request-dto";
import { LLMMessageType } from "../types/llm-message.type";

type CreateAssistantUIModelAdapterParams = {
  flowVersionId: string;
  conversationId: string | undefined;
  onRequestComplete?: () => void;
};

/**
 * Flattens assistant-ui message parts into a plain text string.
 */
const toMessageText = (
  content: readonly ThreadUserMessagePart[] | ThreadMessage["content"],
) => {
  return content
    .map((part) => {
      if (part.type === "text" || part.type === "reasoning") return part.text;
      return "";
    })
    .filter(Boolean)
    .join("\n");
};

/**
 * Creates a ChatModelAdapter that triggers the execution API
 * using ONLY the most recent user input as the argument.
 */
export const createAssistantUIModelAdapter = ({
  flowVersionId,
  conversationId,
  onRequestComplete,
}: CreateAssistantUIModelAdapterParams): ChatModelAdapter => {
  return {
    async *run(options) {
      // Full thread history except the last message which is the current user input
      const allMessageExceptlastOne = options.messages.slice(0, -1);
      const threadMessages = mapThreadToLLMMessages(allMessageExceptlastOne);

      // Get the most recent user message
      const lastMessage = options.messages[options.messages.length - 1];

      // Convert that message into plain text
      const userInputText = lastMessage
        ? toMessageText(lastMessage.content)
        : "";

      // TODO: For now we'll pass the full converstation from frontend but later on we can just pass the user current input and fetch the conversation history in the backend using converstationId (if required for context).
      // Construct the input arguments for the flow
      const inputArguments = {
        triggeredBy: "chat",
        threadMessages: threadMessages,
        userInput: userInputText,
        conversationId: conversationId,
      };

      const request: ExecuteFlowRequestDto = {
        flowVersionId: flowVersionId,
        InputArgumentsJson: JSON.stringify(inputArguments),
        waitForCompletion: true,
      };

      try {
        // 4. Trigger the flow execution
        const response = await executeFlowOnWeb(request);

        // 5. Extract the output data from the job response
        const outputText =
          response.data?.outputDataJson ||
          "Flow executed successfully, but no output data was returned.";

        // 6. Yield the final text back to the assistant-ui chat bubble
        yield {
          content: [
            {
              type: "text",
              text: outputText,
            },
          ],
        };

        onRequestComplete?.();
      } catch (error) {
        console.error("Execution API failed:", error);
        yield {
          content: [
            {
              type: "text",
              text: "An error occurred while executing the workflow.",
            },
          ],
        };
      }
    },
  };
};
function mapThreadToLLMMessages(
  messages: readonly ThreadMessage[],
): LLMMessageType[] {
  return messages
    .filter((msg) => msg.role === "user" || msg.role === "assistant")
    .map((msg) => ({
      role: msg.role as LLMMessageType["role"],
      content: toMessageText(msg.content),
    }))
    .filter((msg) => msg.content.length > 0);
}
