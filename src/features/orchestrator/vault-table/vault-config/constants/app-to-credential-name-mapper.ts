import { VaultAppsEnum } from "../../enums/vault-apps-enum";

export const appToCredentialNameMapper: Record<VaultAppsEnum, string> = {
  [VaultAppsEnum.OpenAI]: "openai_api_key",
  [VaultAppsEnum.AWS]: "aws_access_key",
  [VaultAppsEnum.Twilio]: "twilio_auth_token",
  [VaultAppsEnum.SendGrid]: "sendgrid_api_key",
  [VaultAppsEnum.GitHub]: "github_access_token",
  [VaultAppsEnum.GeneralCredentials]: "general_credentials",
};
