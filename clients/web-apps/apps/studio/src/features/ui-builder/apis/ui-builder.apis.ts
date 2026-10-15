import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { LLMRequestDto } from "@/features/dynamic-config-panel/dtos/llm-providers-dto";
import { getStudioConfigHeaders, getStudioSpaceHeaders } from "@/utils/space-headers";

import {
  CreateUiBuilderVersionPayload,
  UiBuilderProjectDto,
  UiBuilderVersionDto,
} from "../dtos/ui-builder-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/ui-builder`;
const LLM_GENERATE_API_URL: string = `${import.meta.env.VITE_LLMPIPELINE_API_PATH}/llm/generate`;

/** One newline-delimited frame emitted by the LLM pipeline generation stream. */
type LLMStreamFrame = {
  output?: unknown;
  status?: string | null;
  created_on?: string;
  error?: string | null;
};

const parseLLMStreamFrame = (line: string): LLMStreamFrame | null => {
  const payload = line.trim().replace(/^data:\s*/, "");
  if (!payload) return null;
  try {
    return JSON.parse(payload) as LLMStreamFrame;
  } catch {
    return null;
  }
};

/**
 * Streams a UI builder generation from the LLM pipeline, reporting each output
 * delta and resolving with the complete document once the stream ends.
 *
 * The pipeline emits newline-delimited JSON: intermediate frames are output-only
 * deltas, while the final frame is a full response carrying the complete document
 * (or the failure reason) and is identified by its `status`/`created_on` fields.
 */
export const streamUiBuilderGeneration = async (
  request: LLMRequestDto,
  handlers: { onDelta?: (delta: string) => void; signal?: AbortSignal } = {},
): Promise<string> => {
  const response = await fetch(LLM_GENERATE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getStudioConfigHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ ...request, stream: true }),
    signal: handlers.signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Generation failed (${response.status}).`);
  }
  if (!response.body) {
    throw new Error("The generation response had no body.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let streamed = "";
  let result: string | null = null;
  let failure: string | null = null;

  const consumeFrame = (frame: LLMStreamFrame) => {
    if (frame.error) {
      failure = frame.error;
      return;
    }
    if (typeof frame.status === "string" || typeof frame.created_on === "string") {
      if (frame.status === "failed" || frame.status === "cancelled") {
        failure = "The generation stopped before it finished.";
        return;
      }
      result = typeof frame.output === "string" ? frame.output : "";
      return;
    }
    if (typeof frame.output === "string" && frame.output) {
      streamed += frame.output;
      handlers.onDelta?.(frame.output);
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const frame = parseLLMStreamFrame(buffer.slice(0, newlineIndex));
        buffer = buffer.slice(newlineIndex + 1);
        if (frame) consumeFrame(frame);
      }
    }
    const tail = parseLLMStreamFrame(buffer);
    if (tail) consumeFrame(tail);
  } finally {
    reader.releaseLock();
  }

  if (failure) throw new Error(failure);
  return result ?? streamed;
};

/**
 * Retrieves a custom UI builder project by its ID.
 */
const getUiBuilderProject = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<UiBuilderProjectDto>>(`${baseAPIURL}/${id}`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves all generated versions of a custom UI builder project.
 */
const getUiBuilderVersions = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<UiBuilderVersionDto[]>>(`${baseAPIURL}/${id}/versions`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Inserts a new generated version for a custom UI builder project.
 */
const createUiBuilderVersion = (id: string, payload: CreateUiBuilderVersionPayload) => {
  return axiosInstance
    .post<IHttpResponse<UiBuilderVersionDto>>(
      `${baseAPIURL}/${id}/versions`,
      { uiBuilderProjectId: id, ...payload },
      { headers: getStudioSpaceHeaders() },
    )
    .then((res) => res.data);
};

/**
 * Restores a custom UI builder project version as a new head version.
 */
const restoreUiBuilderVersion = (id: string, versionNumber: number) => {
  return axiosInstance
    .post<IHttpResponse<UiBuilderVersionDto>>(
      `${baseAPIURL}/${id}/restore/${versionNumber}`,
      null,
      {
        headers: getStudioSpaceHeaders(),
      },
    )
    .then((res) => res.data);
};

export {
  getUiBuilderProject,
  getUiBuilderVersions,
  createUiBuilderVersion,
  restoreUiBuilderVersion,
};
