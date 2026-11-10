import { type ChatStarterGroup } from "@avplatform/chat";
import { ChatCircleTextIcon, MagicWandIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";

/** Empty-state starters, limited to what the landing chat fulfils today: answers and generated files. */
export const HOME_CHAT_STARTERS: readonly ChatStarterGroup[] = [
  {
    label: "Ask",
    icon: ChatCircleTextIcon,
    prompts: [
      "Draft a friendly follow-up email to a vendor about an overdue invoice",
      "Explain the difference between an AI agent and a rule-based workflow",
      "Turn my meeting notes into action items with owners and due dates:",
    ],
  },
  {
    label: "Build",
    icon: MagicWandIcon,
    prompts: [
      "Build a customer feedback form with a rating, a category and comments",
      "Write a weekly project status report as a document",
      "Make a spreadsheet that tracks monthly expenses by category",
    ],
  },
];

/** "Find" starters, each shown only when the user can open its page. */
export const HOME_CHAT_FIND_STARTERS = {
  label: "Find",
  icon: MagnifyingGlassIcon,
  candidates: [
    { prompt: "Where do I set up a webhook trigger?", route: "/configure/triggers/webhook" },
    { prompt: "Where can I see recent job runs?", route: "/orchestrator/jobs" },
    { prompt: "Where do I store an API key securely?", route: "/configure/vault" },
    { prompt: "How do I add a user to my organization?", route: "/tenant/users" },
    { prompt: "Where do I connect a model provider?", route: "/tenant/model-providers" },
    { prompt: "Where are the files I've generated?", route: "/assist/artifacts" },
  ],
} as const;
