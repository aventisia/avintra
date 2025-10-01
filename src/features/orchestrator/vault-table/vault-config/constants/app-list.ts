export const appList = [
  { label: "OpenAi", value: "OpenAiApi" },
  { label: "AWS", value: "Aws" },
  { label: "Twilio API", value: "TwilioApi" },
  { label: "SendGrid API", value: "SendGridApi" },
  { label: "GitHub API", value: "GitHubApi" },
  { label: "General Credentials", value: "GeneralCredentials" },
  // { label: "Google Gemini(PaLM)", value: "googleGemini" },
  // { label: "Microsoft Excel OAuth2 API", value: "microsoftExcel" },
  // { label: "Salesforce OAuth2 API", value: "salesforceOAuth2API" },
  // { label: "Discord", value: "discord" },
  // { label: "Notion", value: "notion" },
  // { label: "Firebase", value: "firebase" },
  // { label: "Stripe", value: "stripe" },
  // { label: "Salesforce", value: "salesforce" },
  // { label: "HubSpot", value: "hubspot" },
];

export const vaultIconMapper: Record<string, string> = {
  OpenAiApi: "/brand-img/openai.svg",
  Aws: "/brand-img/aws.svg",
  TwilioApi: "/brand-img/twilio.svg",
  SendGridApi: "/brand-img/sendgrid.svg",
  GitHubApi: "/brand-img/github.svg",
  GeneralCredentials: "/assets/CredentialManager.svg",
};
