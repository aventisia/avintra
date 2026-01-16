export interface ILLMConfiguration {
  nodePrompt: string;
  model: string;
  provider: string;
  isBYOKEnabled?: boolean;
  credentialId?: string;
  isJsonOutput?: boolean;
  temperature: number;
  topP: number;
  maxOutputToken: number;
}
