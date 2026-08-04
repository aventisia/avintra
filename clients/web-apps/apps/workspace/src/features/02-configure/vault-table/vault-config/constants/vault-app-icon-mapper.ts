import { VaultAppsEnum } from "../../enums/vault-apps-enum";

export const vaultAppIconMapper: Record<VaultAppsEnum, string> = {
  [VaultAppsEnum.OpenAI]: "/brand-img/openai.svg",
  [VaultAppsEnum.AWS]: "/brand-img/aws.svg",
  [VaultAppsEnum.Twilio]: "/brand-img/twilio.svg",
  [VaultAppsEnum.SendGrid]: "/brand-img/sendgrid.svg",
  [VaultAppsEnum.GitHub]: "/brand-img/github.svg",
  [VaultAppsEnum.M365]: "/brand-img/m365.svg",
  [VaultAppsEnum.GeneralCredentials]: "/assets/CredentialManager.svg",
  [VaultAppsEnum.GoogleGemini]: "/brand-img/gemini.svg",
  [VaultAppsEnum.GoogleWorkspace]: "/assets/GoogleWorkspace.svg",
  [VaultAppsEnum.OpenRouter]: "/brand-img/openrouter.svg",
  [VaultAppsEnum.ElevenLabs]: "/brand-img/elevenlabs.svg",
  [VaultAppsEnum.AzureStorage]: "/assets/Azure.svg",
  [VaultAppsEnum.ConnectionString]: "/assets/Database.svg",
  [VaultAppsEnum.Qdrant]: "/assets/Qdrant.svg",
  [VaultAppsEnum.Anthropic]: "/brand-img/anthropic.svg",
  [VaultAppsEnum.CustomApiTool]: "/assets/CredentialManager.svg",
};
