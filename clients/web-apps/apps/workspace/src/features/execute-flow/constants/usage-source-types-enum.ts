/**
 * Specifies the types of sources or entities that can consume credits,
 * such as Agents.
 */
export enum UsageSourceTypesEnum {
  /**
   * Indicates that the credits were used by or for an Agent.
   */
  Agent,

  /**
   * Indicates that the credits were consumed by the platform itself.
   */
  Platform,
}
