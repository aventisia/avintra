import {
  ChatModelAdapter,
  ThreadMessage,
  ThreadUserMessagePart,
} from "@assistant-ui/react";

import { executeFlowOnWeb } from "../../apis/execute-flow-apis";
import { ExecuteFlowRequestDto } from "../../dtos/execute-flow-request-dto";

type CreateAssistantUIModelAdapterParams = {
  flowVersionId: string;
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
}: CreateAssistantUIModelAdapterParams): ChatModelAdapter => {
  return {
    async *run(options) {
      // 1. Isolate the very last message in the thread (what the user just typed)
      const lastMessage = options.messages[options.messages.length - 1];

      // 2. Convert that message into plain text
      const userInputText = lastMessage
        ? toMessageText(lastMessage.content)
        : "";

      // 3. Construct the input arguments for the flow
      const inputArguments = {
        user: userInputText,
      };

      const request: ExecuteFlowRequestDto = {
        flowVersionId: flowVersionId,
        InputArgumentsJson: JSON.stringify(inputArguments),
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
