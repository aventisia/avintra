import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";
import { type UiBuilderDataConnection } from "@avplatform/ui/ui-builder-host";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import {
  CreateUiBuilderVersionPayload,
  UiBuilderAssetDto,
  UiBuilderModelDto,
  UiBuilderProjectDto,
  UiBuilderProjectSettingsDto,
  UiBuilderQueueDto,
  UiBuilderVersionDto,
} from "../dtos/ui-builder-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/ui-builder`;
const queueAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/queue`;
const LLM_GENERATE_API_URL: string = `${import.meta.env.VITE_LLMPIPELINE_API_PATH}/v2/llm/generate`;

/** Request body sent to the LLM pipeline's LiteLLM generation route. */
export type UiBuilderLlmRequest = {
  provider: string;
  model: string;
  input: { role: "system" | "user" | "assistant"; content: string }[];
  stream: boolean;
  is_json_output?: boolean;
  is_byok_enabled: boolean;
  credential_name?: string | null;
  max_output_tokens?: number;
  temperature?: number;
  skill_names?: string[];
  files?: string[];
  ref_type: string;
  ref_id: string;
  ref_name: string;
  action: string;
};

/** Options shared by builder LLM calls. */
export type UiBuilderLlmCallOptions = {
  envType: string;
  onDelta?: (delta: string) => void;
  signal?: AbortSignal;
};

/** One newline-delimited frame emitted by the LLM pipeline generation stream. */
type LLMStreamFrame = {
  output?: unknown;
  status?: string | null;
  created_on?: string;
  finish_reason?: string | null;
  done?: boolean;
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

const llmHeaders = (envType: string) => ({
  "Content-Type": "application/json",
  ...getStudioSpaceHeaders(),
  "X-Env-Type": envType,
});

const parseErrorDetail = (text: string): string | null => {
  try {
    const parsed = JSON.parse(text) as { detail?: unknown; message?: unknown };
    const detail = parsed.detail ?? parsed.message;
    return typeof detail === "string" && detail ? detail : null;
  } catch {
    return null;
  }
};

const readErrorResponse = async (response: Response) => {
  const text = await response.text();
  return parseErrorDetail(text) ?? (text || `Generation failed (${response.status}).`);
};

/**
 * Streams a builder generation from the LLM pipeline, reporting each output delta
 * and resolving with the complete output once the stream ends.
 *
 * The pipeline emits newline-delimited JSON: intermediate frames are output-only
 * deltas, while the final frame is a full response carrying the complete output
 * (identified by its `status`/`created_on` fields) or an error frame.
 */
export const streamUiBuilderGeneration = async (
  request: UiBuilderLlmRequest,
  { envType, onDelta, signal }: UiBuilderLlmCallOptions,
): Promise<string> => {
  const response = await fetch(LLM_GENERATE_API_URL, {
    method: "POST",
    headers: llmHeaders(envType),
    credentials: "include",
    body: JSON.stringify({ ...request, stream: true }),
    signal,
  });

  if (!response.ok) throw new Error(await readErrorResponse(response));
  if (!response.body) throw new Error("The generation response had no body.");

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
      if (frame.status === "incomplete") {
        failure =
          "The model stopped before the page was complete (output limit reached). Try a smaller change or a model with a larger output limit.";
        return;
      }
      result = typeof frame.output === "string" ? frame.output : "";
      return;
    }
    if (typeof frame.output === "string" && frame.output) {
      streamed += frame.output;
      onDelta?.(frame.output);
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

/** Runs a non-streaming builder call that returns JSON output. */
export const generateUiBuilderJson = async <T>(
  request: UiBuilderLlmRequest,
  { envType, signal }: Omit<UiBuilderLlmCallOptions, "onDelta">,
): Promise<T> => {
  const response = await fetch(LLM_GENERATE_API_URL, {
    method: "POST",
    headers: llmHeaders(envType),
    credentials: "include",
    body: JSON.stringify({ ...request, stream: false, is_json_output: true }),
    signal,
  });

  if (!response.ok) throw new Error(await readErrorResponse(response));

  const body = (await response.json()) as { output?: unknown; error?: string | null };
  if (body.error) throw new Error(body.error);
  if (typeof body.output === "string") {
    const cleaned = body.output.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "");
    return JSON.parse(cleaned) as T;
  }
  return body.output as T;
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

/**
 * Pins the current head version as the published version.
 */
const publishUiBuilderProject = (id: string) => {
  return axiosInstance
    .post<IHttpResponse<UiBuilderProjectDto>>(`${baseAPIURL}/${id}/publish`, null, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves the tenant's enabled Text models with the credential each provider uses.
 */
const getUiBuilderModels = () => {
  return axiosInstance
    .get<IHttpResponse<UiBuilderModelDto[]>>(`${baseAPIURL}/models`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Replaces the data connections bound to a custom UI builder project.
 */
const updateUiBuilderDataConnections = (id: string, connections: UiBuilderDataConnection[]) => {
  return axiosInstance
    .put<IHttpResponse<UiBuilderProjectDto>>(`${baseAPIURL}/${id}/data-connections`, connections, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves the queues visible to the user in the given environment.
 */
const getUiBuilderQueues = (envType: string) => {
  return axiosInstance
    .get<IHttpResponse<UiBuilderQueueDto[]>>(`${queueAPIURL}/list`, {
      headers: { ...getStudioSpaceHeaders(), "X-Env-Type": envType },
    })
    .then((res) => res.data);
};

/**
 * Retrieves one queue, including its work item schema, in the given environment.
 */
const getUiBuilderQueue = (queueId: string, envType: string) => {
  return axiosInstance
    .get<IHttpResponse<UiBuilderQueueDto>>(`${queueAPIURL}/${queueId}`, {
      headers: { ...getStudioSpaceHeaders(), "X-Env-Type": envType },
    })
    .then((res) => res.data);
};

/**
 * Creates a queue in the given environment.
 */
const createUiBuilderQueue = (queue: UiBuilderQueueDto, envType: string) => {
  return axiosInstance
    .post<IHttpResponse<UiBuilderQueueDto>>(queueAPIURL, queue, {
      headers: { ...getStudioSpaceHeaders(), "X-Env-Type": envType },
    })
    .then((res) => res.data);
};

/**
 * Inserts work items into a queue in the given environment; the queue's schema rules apply.
 */
const createUiBuilderQueueWorkItems = (
  queueId: string,
  envType: string,
  items: Record<string, unknown>[],
) => {
  return axiosInstance
    .post<IHttpResponse<unknown>>(
      `${queueAPIURL}/workitem`,
      { queueId, workItemData: JSON.stringify(items) },
      { headers: { ...getStudioSpaceHeaders(), "X-Env-Type": envType } },
    )
    .then((res) => res.data);
};

/**
 * Replaces the owner-managed settings of a custom UI builder project.
 */
const updateUiBuilderProjectSettings = (id: string, settings: UiBuilderProjectSettingsDto) => {
  return axiosInstance
    .put<IHttpResponse<UiBuilderProjectDto>>(`${baseAPIURL}/${id}/settings`, settings, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves custom UI builder projects offered to the tenant as templates.
 */
const getUiBuilderTemplates = () => {
  return axiosInstance
    .get<IHttpResponse<UiBuilderProjectDto[]>>(`${baseAPIURL}/templates`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Creates a new custom UI builder project from a template.
 */
const cloneUiBuilderProject = (
  id: string,
  project: Pick<UiBuilderProjectDto, "name" | "description">,
) => {
  return axiosInstance
    .post<IHttpResponse<UiBuilderProjectDto>>(
      `${baseAPIURL}/${id}/clone`,
      { ...project, isTenantWideAccess: false, isPublished: false, accessLevel: "Owner" },
      { headers: getStudioSpaceHeaders() },
    )
    .then((res) => res.data);
};

/**
 * Retrieves the assets uploaded to a custom UI builder project.
 */
const getUiBuilderAssets = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<UiBuilderAssetDto[]>>(`${baseAPIURL}/${id}/assets`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Uploads an image asset to a custom UI builder project.
 */
const createUiBuilderAsset = (id: string, asset: UiBuilderAssetDto) => {
  return axiosInstance
    .post<IHttpResponse<UiBuilderAssetDto>>(`${baseAPIURL}/${id}/assets`, asset, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Deletes an asset from a custom UI builder project.
 */
const deleteUiBuilderAsset = (id: string, assetId: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}/assets/${assetId}`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves every asset of a custom UI builder project with its content, for rendering the interface.
 */
const getUiBuilderAssetContents = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<UiBuilderAssetDto[]>>(`${baseAPIURL}/${id}/assets/content`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Names a custom UI builder version as a checkpoint, or clears its name.
 */
const updateUiBuilderVersionLabel = (id: string, versionNumber: number, label: string | null) => {
  return axiosInstance
    .put<IHttpResponse<UiBuilderVersionDto>>(
      `${baseAPIURL}/${id}/versions/${versionNumber}/label`,
      { label },
      { headers: getStudioSpaceHeaders() },
    )
    .then((res) => res.data);
};

export {
  getUiBuilderProject,
  getUiBuilderVersions,
  createUiBuilderVersion,
  restoreUiBuilderVersion,
  publishUiBuilderProject,
  getUiBuilderModels,
  updateUiBuilderDataConnections,
  getUiBuilderQueues,
  getUiBuilderQueue,
  createUiBuilderQueue,
  createUiBuilderQueueWorkItems,
  updateUiBuilderProjectSettings,
  getUiBuilderTemplates,
  cloneUiBuilderProject,
  getUiBuilderAssets,
  createUiBuilderAsset,
  deleteUiBuilderAsset,
  getUiBuilderAssetContents,
  updateUiBuilderVersionLabel,
};
