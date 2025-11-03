/**
 * Specifies the types of sources or entities that can consume credits,
 * such as AI Agents or AI Models.
 */
export enum UsageSourceTypesEnum {
  /**
   * Indicates that the credits were used by or for an AI Agent.
   */
  Agent = "AI Agent",

  /**
   * Indicates that the credits were used by or for an AI Model.
   */
  AIModel = "AI Model",

  /**
   * Indicates that the credits were consumed by the platform itself.
   */
  Platform = "Platform",
}
