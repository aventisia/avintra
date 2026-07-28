export interface AITaskDto {
  /** Unique identifier for the task template */
  id: string;

  /** Name of the task, used to uniquely identify and reference it */
  name: string;

  /** System-level input prompt template providing context or instructions for the LLM */
  systemInput?: string;

  /** User-level input prompt template where dynamic user data is injected */
  userInput?: string;

  /** Name of the model provider (e.g., OpenAI, Anthropic) used for task execution */
  modelProvider: string;

  /** Name of the model used by the LLM provider (e.g., GPT-4, Claude-2) */
  model: string;

  /** Flag indicating whether the LLM output should be returned in JSON format */
  isJsonOutput: boolean;

  /** Optional JSON schema defining the expected structure and validation rules for the output */
  jsonSchema?: string;

  /** Maximum number of tokens the LLM can generate in the output */
  maxOutputTokens: number;

  /** Temperature setting for the LLM; controls randomness of output */
  temperature: number;

  /** Top-p setting controlling diversity by considering only the top probabilities (0.0 - 1.0) */
  topP: number;

  /** Flag indicating whether the LLM's response should be streamed */
  stream: boolean;

  /** Flag indicating whether the user record is disabled (nullable) */
  isDisabled?: boolean | null;

  /** Username of the user who created the task (for response only) */
  createdBy?: string;

  /** Timestamp when the task was created (for response only) */
  createdOn?: string;

  /** Username of the user who last modified the task (for response only) */
  lastModifiedBy?: string;

  /** Timestamp when the task was last modified (for response only) */
  lastModifiedOn?: string;
}
