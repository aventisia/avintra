import { VaultAppsEnum } from "../../enums/vault-apps-enum";

export const vaultAppsSelectOptions: Record<VaultAppsEnum, { label: string; value: string }> = {
  [VaultAppsEnum.OpenAI]: { label: "OpenAI", value: "OpenAI" },
  [VaultAppsEnum.AWS]: { label: "AWS", value: "AWS" },
  [VaultAppsEnum.Twilio]: { label: "Twilio", value: "Twilio" },
  [VaultAppsEnum.SendGrid]: { label: "SendGrid", value: "SendGrid" },
  [VaultAppsEnum.GitHub]: { label: "GitHub", value: "GitHub" },
  [VaultAppsEnum.M365]: { label: "M365", value: "M365" },
  [VaultAppsEnum.GeneralCredentials]: {
    label: "General Credentials",
    value: "GeneralCredentials",
  },
  [VaultAppsEnum.GoogleGemini]: {
    label: "Google Gemini",
    value: "GoogleGemini",
  },
  [VaultAppsEnum.GoogleWorkspace]: {
    label: "Google Workspace",
    value: "GoogleWorkspace",
  },
  [VaultAppsEnum.OpenRouter]: { label: "OpenRouter", value: "OpenRouter" },
  [VaultAppsEnum.ElevenLabs]: { label: "ElevenLabs", value: "ElevenLabs" },
  [VaultAppsEnum.AzureStorage]: {
    label: "Azure Storage",
    value: "AzureStorage",
  },
  [VaultAppsEnum.ConnectionString]: {
    label: "Connection String",
    value: "ConnectionString",
  },
  [VaultAppsEnum.Qdrant]: { label: "Qdrant", value: "Qdrant" },
  [VaultAppsEnum.Anthropic]: { label: "Anthropic", value: "Anthropic" },
  [VaultAppsEnum.CustomApiTool]: { label: "Custom API Tool", value: "CustomApiTool" },
};

// export const appList = [
//   { label: "OpenAI", value: VaultAppsEnum.OpenAI },
//   { label: "AWS", value: VaultAppsEnum.AWS },
//   { label: "Twilio", value: VaultAppsEnum.Twilio },
//   { label: "SendGrid", value: VaultAppsEnum.SendGrid },
//   { label: "GitHub", value: VaultAppsEnum.GitHub },
//   { label: "General Credentials", value: VaultAppsEnum.GeneralCredentials },
//   // { label: "Google Gemini(PaLM)", value: "googleGemini" },
//   // { label: "Microsoft Excel OAuth2 API", value: "microsoftExcel" },
//   // { label: "Salesforce OAuth2 API", value: "salesforceOAuth2API" },
//   // { label: "Discord", value: "discord" },
//   // { label: "Notion", value: "notion" },
//   // { label: "Firebase", value: "firebase" },
//   // { label: "Stripe", value: "stripe" },
//   // { label: "Salesforce", value: "salesforce" },
//   // { label: "HubSpot", value: "hubspot" },
// ];
