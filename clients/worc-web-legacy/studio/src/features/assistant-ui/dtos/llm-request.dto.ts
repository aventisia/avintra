import { ActionTypesEnum } from "@/features/credits-management/constants/action-types-enum";
import { UsageSourceTypesEnum } from "@/features/credits-management/constants/usage-source-types-enum";

import { LLMMessageType, LLMProviderType } from "..";

export interface ToolAction {
  /**
   * Action that the tool is permitted to perform
   * (e.g. "send_email")
   */
  action: string;

  /**
   * Determines whether execution is automatic
   * or requires human approval.
   */
  approval: "auto" | "human";
}

export interface ToolConfig {
  /**
   * Name of the tool or external service
   * (e.g. "gmail")
   */
  tool: string;

  /**
   * Identifier for the credentials
   * used to access the tool.
   */
  credential_id: string;

  /**
   * List of permitted actions
   * for this tool.
   */
  actions: ToolAction[];
}

/**
 * Represents a request for generating an LLM response.
 */
export interface LLMRequestDto {
  /**
   * Provider of the LLM model.
   */
  provider: LLMProviderType;

  /**
   * The model to be used for generation.
   */
  model: string;

  /**
   * Input content for the LLM model, either as a string or a list of messages.
   */
  input: string | LLMMessageType[];

  /**
   * Optional list of base64-encoded files for OCR or text extraction.
   */
  files?: string[];

  /**
   * Optional tool/service configurations.
   */
  tool_config?: ToolConfig[];

  /**
   * Indicates whether the output should be parsed as JSON.
   */
  is_json_output?: boolean;

  /**
   * Optional JSON schema to validate the response.
   */
  json_schema?: string | null;

  /**
   * Maximum number of tokens for the output.
   */
  max_output_tokens?: number | null;

  /**
   * Enables Bring Your Own Key (BYOK) support.
   */
  is_byok_enabled?: boolean;

  /**
   * Optional credential ID for BYOK.
   */
  credential_id?: string | null;

  /**
   * Temperature setting for the model.
   */
  temperature?: number;

  /**
   * Top-p setting for the model.
   */
  top_p?: number;

  /**
   * Flag to indicate whether to stream the response.
   */
  stream?: boolean;

  /**
   * Gets or sets the reference type (e.g.Agent, Platform) associated with the usage.
   */
  ref_type: UsageSourceTypesEnum | string;

  /**
   * Gets or sets the unique identifier for the reference object.
   */
  ref_id: string;

  /**
   * Gets or sets the name of the reference object (e.g., my_new_agent).
   */
  ref_name: string;

  /**
   * Gets or sets the action type (e.g.AgentExecution) associated with the usage.
   */
  action: ActionTypesEnum | string;

  /**
   * Optional agent name.
   */
  agent_name?: string | null;

  /**
   * Knowledge base names used
   * for chunk retrieval scoping.
   */
  kb_names?: string[];

  /**
   * Number of KB chunks to retrieve.
   *
   * Backend constraints:
   * min: 1
   * max: 100
   * default: 5
   */
  top_k?: number;
}
