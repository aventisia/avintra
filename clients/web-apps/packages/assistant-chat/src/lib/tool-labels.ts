/**
 * Human-readable labels for tool calls shown in the chat activity stream.
 *
 * Tool names arrive in several shapes: snake_case platform tools
 * (`gmail_send_email`), dotted Corsair paths (`openai.api.models.list`), and the
 * sanitized underscored Corsair form (`openai_api_models_list`). The label
 * splits on any of those separators and, when the first token is a known
 * provider, renders "{Provider} · {action}".
 */

/** Known integration names, keyed by the lowercased first token. */
const KNOWN_PROVIDERS: Record<string, string> = {
  anthropic: "Anthropic",
  asana: "Asana",
  calendar: "Calendar",
  corsair: "Corsair",
  github: "GitHub",
  gitlab: "GitLab",
  gmail: "Gmail",
  googlecalendar: "Google Calendar",
  hubspot: "HubSpot",
  jira: "Jira",
  linear: "Linear",
  notion: "Notion",
  openai: "OpenAI",
  outlook: "Outlook",
  salesforce: "Salesforce",
  slack: "Slack",
  stripe: "Stripe",
  twilio: "Twilio",
  zendesk: "Zendesk",
};

const sentenceCase = (value: string): string => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

/**
 * Turn a raw tool name into a compact display label.
 *
 * `gmail_send_email` → "Gmail · Send email"; `list_channels` → "List channels";
 * unknown/empty names fall back to "Tool".
 */
export const humanizeToolLabel = (toolName?: string): string => {
  if (!toolName) return "Tool";

  const tokens = toolName.split(/[._\-\s]+/).filter(Boolean);
  if (tokens.length === 0) return "Tool";

  const provider = KNOWN_PROVIDERS[tokens[0].toLowerCase()];
  if (provider && tokens.length > 1) {
    return `${provider} · ${sentenceCase(tokens.slice(1).join(" "))}`;
  }

  return sentenceCase(tokens.join(" "));
};
