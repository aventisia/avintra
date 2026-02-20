export interface ModelConfigType {
  is_byok_enabled: boolean;
  provider: string;
  credential_id: string;
  model: string;
  temperature: number;
  top_p: number;
  is_json_output: boolean;
  max_output_tokens: number;
}
