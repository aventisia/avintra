/**
 * DTO for execute flow API response
 */
export interface ExecuteFlowResponseDto {
  jobId?: string;
  flowVersionId?: string;
  outputDataJson?: LLMOutputDto | string;
  jobStatus?: string;
}

/**
 * Generic object payload returned by tools/functions.
 */
export type LLMToolPayload = Record<string, unknown>;

/**
 * Function/tool call output item.
 */
export interface LLMToolsOutputDto {
  type: string;

  call_id: string;

  output: {
    agentId?: string;
    agentName?: string;
    provider?: string;
    action?: string;
    credentialId?: string;

    /**
     * Dynamic payload returned by tool execution.
     * Can contain any object shape.
     */
    payload?: LLMToolPayload;

    /**
     * Allow additional dynamic fields.
     */
    [key: string]: unknown;
  };
}

/**
 * Supported output types from LLM.
 */
export type LLMOutputDto = {
  text?: string;
  tools?: LLMToolsOutputDto[];
  recommended_actions: string[];
};
