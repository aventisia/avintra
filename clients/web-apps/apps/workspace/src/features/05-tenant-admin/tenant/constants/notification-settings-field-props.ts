import { SwitchFieldProps } from "@avplatform/ui/form";

// Low Credit
const lowCreditsProps: SwitchFieldProps = {
  name: "lowCredits",
  label: "Low Credit",
  description: "Notify tenant admins when the credit balance falls below the configured threshold",
};

// Subscription
const subscriptionProps: SwitchFieldProps = {
  name: "subscription",
  label: "Subscription",
  description: "Notify tenant admins of an upcoming subscription renewal",
};

// Publish Agent
const publishAgentProps: SwitchFieldProps = {
  name: "publishAgent",
  label: "Publish Agent",
  description: "Notify orchestrator managers when an agent is published and ready for use",
};

export { lowCreditsProps, subscriptionProps, publishAgentProps };
