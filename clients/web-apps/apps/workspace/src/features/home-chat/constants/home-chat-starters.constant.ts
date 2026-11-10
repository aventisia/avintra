import { type ChatStarterGroup } from "@avplatform/chat";
import { ChatCircleTextIcon, MagicWandIcon } from "@phosphor-icons/react";

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
      "Create a five-slide deck introducing our onboarding process",
    ],
  },
];
