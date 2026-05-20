export const TOOLS = [
  {
    label: "Microsoft 365 Outlook",
    value: "outlook",
    icon: "/brand-img/m365.svg",
  },
  { label: "Twilio", value: "twilio", icon: "/brand-img/twilio.svg" },
  {
    label: "Google Gemini",
    value: "googlegemini",
    icon: "/brand-img/gemini.svg",
  },
  { label: "GitHub", value: "github", icon: "/brand-img/github.svg" },
];

export const TOOL_ACTIONS: Record<string, { label: string; value: string }[]> =
  {
    outlook: [
      { label: "send_email", value: "send_email" },
      { label: "read_emails", value: "read_emails" },
      { label: "search_email", value: "search_email" },
      { label: "delete_email", value: "delete_email" },
    ],
    twilio: [
      { label: "send_sms", value: "send_sms" },
      { label: "send_whatsapp_message", value: "send_whatsapp_message" },
      { label: "receive_messages", value: "receive_messages" },
    ],
    googlegemini: [
      { label: "search_web", value: "search_web" },
      { label: "get_latest_info", value: "get_latest_info" },
      { label: "find_places", value: "find_places" },
    ],
    github: [
      { label: "create_issue", value: "create_issue" },
      { label: "read_repo", value: "read_repo" },
      { label: "create_pr", value: "create_pr" },
    ],
  };

export const APPROVAL_OPTIONS = [
  { label: "Human Approval", value: "human" },
  { label: "Auto Approval", value: "auto" },
];
