export interface ILLMConfiguration {
  nodePrompt: string;
  model: string;
  provider: string;
  isByokEnabled?: boolean;
  credentialId?: string;
  isJsonOutput?: boolean;
  temperature: number;
  topP: number;
  maxOutputToken: number;
}
