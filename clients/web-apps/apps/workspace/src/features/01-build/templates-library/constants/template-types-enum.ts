/**
 * Enum representing the types of Project Template.
 *
 * IMPORTANT NOTE: Any changes to this file should be manually synced with back-end enum file and
 * also we need to update existing flows in the database.
 */
export enum ProjectTemplateTypesEnum {
  Agent = "Agent",
  ChatAgent = "ChatAgent",
  VoiceAgent = "VoiceAgent",
  Block = "Block",
  Prompt = "Prompt",
}
