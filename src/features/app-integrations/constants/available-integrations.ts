import { AvailableIntegrationListDTO } from "../dto/available-integration-list-dto";

export const availableIntegrations: AvailableIntegrationListDTO[] = [
  {
    id: window.crypto.randomUUID(),
    name: "Sendgrid",
    value: "sendgrid",
    icon: "/brand-img/sendgrid.svg",
    description:
      "Easily send transactional and marketing emails using Sendgrid integration.",
  },
  {
    id: window.crypto.randomUUID(),
    name: "Open AI",
    value: "openai",
    icon: "/brand-img/openai.svg",
    description:
      "Integrate advanced AI capabilities like natural language processing and content generation with OpenAI.",
  },
  {
    id: window.crypto.randomUUID(),
    name: "Google Drive",
    value: "google_drive",
    icon: "/brand-img/google_drive.svg",
    description:
      "Access, manage, and sync files directly from your Google Drive account.",
  },
  {
    id: window.crypto.randomUUID(),
    name: "One Drive",
    value: "one_drive",
    icon: "/brand-img/one_drive.svg",
    description:
      "Connect your Microsoft OneDrive to store and retrieve files seamlessly within the app.",
  },
  {
    id: window.crypto.randomUUID(),
    name: "Gemini",
    value: "gemini",
    icon: "/brand-img/gemini.svg",
    description:
      "Leverage Google’s Gemini AI to generate content, analyze data, and automate workflows.",
    disabled: true,
  },
  {
    id: window.crypto.randomUUID(),
    name: "Twilio",
    value: "twilio",
    icon: "/brand-img/twilio.svg",
    description:
      "Send SMS, make voice calls, and manage communications using Twilio’s robust APIs.",
    disabled: true,
  },
  {
    id: window.crypto.randomUUID(),
    name: "Eleven Labs",
    value: "elevenLabs",
    icon: "/brand-img/elevenlabs.svg",
    description:
      "Generate realistic AI voiceovers and text-to-speech audio using Eleven Labs integration.",
    disabled: true,
  },
  {
    id: window.crypto.randomUUID(),
    name: "AWS Secret Manager",
    value: "aws-secret-manager",
    icon: "/brand-img/aws-secret-manager.svg",
    description:
      "Securely store, manage, and access sensitive credentials using AWS Secrets Manager.",
    disabled: true,
  },
  {
    id: window.crypto.randomUUID(),
    name: "AWS S3",
    value: "aws-s3",
    icon: "/brand-img/aws-s3.svg",
    description:
      "Store and retrieve large-scale data reliably with Amazon S3 cloud storage integration.",
    disabled: true,
  },
];
