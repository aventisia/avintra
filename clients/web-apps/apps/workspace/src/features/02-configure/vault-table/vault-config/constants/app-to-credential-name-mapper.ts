import { VaultAppsEnum } from "../../enums/vault-apps-enum";

export const appToCredentialNameMapper: Record<VaultAppsEnum, string> = {
  [VaultAppsEnum.OpenAI]: "openai_api_key",
  [VaultAppsEnum.AWS]: "aws_access_key",
  [VaultAppsEnum.Twilio]: "twilio_auth_token",
  [VaultAppsEnum.SendGrid]: "sendgrid_api_key",
  [VaultAppsEnum.GitHub]: "github_access_token",
  [VaultAppsEnum.M365]: "m365_credential",
  [VaultAppsEnum.GeneralCredentials]: "general_credentials",
  [VaultAppsEnum.GoogleGemini]: "google_gemini",
  [VaultAppsEnum.GoogleWorkspace]: "google_workspace",
  [VaultAppsEnum.OpenRouter]: "open_router",
  [VaultAppsEnum.ElevenLabs]: "eleven_labs",
  [VaultAppsEnum.AzureStorage]: "azure_storage",
  [VaultAppsEnum.ConnectionString]: "connection_string",
  [VaultAppsEnum.Qdrant]: "qdrant_api_key",
  [VaultAppsEnum.Anthropic]: "anthropic_api_key",
  [VaultAppsEnum.CustomApiTool]: "custom_api_tool",
};
