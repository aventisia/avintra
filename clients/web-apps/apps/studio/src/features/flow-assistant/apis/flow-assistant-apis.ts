import { getStudioSpaceHeaders } from "@/utils/space-headers";

import { FLOW_ASSISTANT_ENDPOINT_SUFFIX } from "../constants";
import { FlowAssistantRequestDto } from "../dtos/flow-assistant-request-dto";
import { FlowAssistantFrame } from "../types/flow-assistant-frame-type";
import { parseFlowAssistantFrame, parseSsePayloads } from "../utils/parse-sse.util";

const baseAPIURL = `${import.meta.env.VITE_WORKSPACE_API_PATH}${FLOW_ASSISTANT_ENDPOINT_SUFFIX}`;

/**
 * Streams normalized flow-assistant frames from the WorkspaceAPIs SSE endpoint.
 *
 * @param request The flow-assistant request payload.
 * @param signal Optional AbortController signal to cancel the stream.
 */
export async function* streamFlowAssistant(
  request: FlowAssistantRequestDto,
  signal?: AbortSignal,
): AsyncGenerator<FlowAssistantFrame> {
  const response = await fetch(baseAPIURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...getStudioSpaceHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Flow assistant request failed (${response.status}).`);
  }

  if (!response.body) {
    throw new Error("Flow assistant response has no body.");
  }

  for await (const payload of parseSsePayloads(response.body)) {
    const frame = parseFlowAssistantFrame(payload);
    if (frame) yield frame;
  }
}
