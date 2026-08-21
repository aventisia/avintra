import { ModelType } from "../enums/model-type-enum";
import { OutputConsumer } from "../enums/output-consumer-enum";

/**
 * An AI model used by the agent, resolved from the flow config at save-time,
 * enriched with a human-entered assessment.
 */
export interface AiModelDto {
  /** Model provider (e.g. OpenAI, Azure OpenAI). */
  provider: string;
  /** The model identifier. */
  model: string;
  /** The credential name referenced by the node. */
  credentialName: string;
  /** Whether bring-your-own-key is enabled. */
  isByokEnabled: boolean;

  // ---- Resolved per-node context ----

  /** The name of the flow node that uses this model. */
  nodeName: string;
  /** Knowledge bases linked to the node. */
  linkedKnowledgeBases: string[];
  /** Skills linked to the node. */
  linkedSkills: string[];
  /** Tools linked to the node. */
  linkedTools: string[];

  // ---- Human-entered assessment ----

  /** Per-model risk rating. */
  riskRating: string;
  /** The type of the model (Conversation, Inferencing, Generative). */
  modelType: ModelType;
  /** Who consumes the model's output (multi-select). */
  outputConsumedBy: OutputConsumer[];
  /** Ongoing monitoring plan (e.g. drift/quality checks). */
  monitoringPlan: string;
  /** Allowed use cases / guardrails for this model. */
  usageRestrictions: string;
  /** Specific risks associated with this model. */
  risks: string;
  /** Mitigations for the above risks. */
  mitigations: string;
}
