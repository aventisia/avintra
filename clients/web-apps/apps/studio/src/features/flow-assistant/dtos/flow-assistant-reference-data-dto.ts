/** Compact reference values the flow assistant may use to fill node configuration. */
export interface FlowAssistantReferenceDataDto {
  queues: string[];
  agents: string[];
  blocks: string[];
  modelProviders: string[];
  skills: string[];
  knowledgeBases: string[];
}
