/**
 * Specifies the types of sources or entities that can consume credits,
 * such as AI Agents or AI Models.
 */
export enum UsageSourceTypesEnum {
  /**
   * Indicates that the credits were used by or for an AI Agent.
   */
  Agent,

  /**
   * Indicates that the credits were used by or for an AI Model.
   */
  AIModel,

  /**
   * Indicates that the credits were consumed by the platform itself.
   */
  Platform,
}
