import { ToolProvider } from "../constants/tools-provider-enum";

export const toolIconMapper: Record<ToolProvider, string> = {
  [ToolProvider.GOOGLE_GEMINI]: "/brand-img/gemini.svg",

  [ToolProvider.OUTLOOK]: "/brand-img/m365.svg",

  [ToolProvider.TWILIO]: "/brand-img/twilio.svg",

  [ToolProvider.GITHUB]: "/brand-img/github.svg",
};
