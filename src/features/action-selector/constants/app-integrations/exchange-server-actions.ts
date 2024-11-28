import { NodeDataType } from "@/types/node-data-type";

export const exchangeServerActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "connectToExchangeServer",
    label: "Connect to Exchange server",
    description: "Open a new connection to an Exchange server",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "retrieveExchangeEmailMessages",
    label: "Retrieve Exchange email messages",
    description: "Retrieve email messages from the specified Exchange server",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "sendExchangeEmailMessage",
    label: "Send Exchange email message",
    description: "Create and send a new email message",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "processExchangeEmailMessages",
    label: "Process Exchange email messages",
    description:
      "Move, delete or mark as unread an email message (or a list of email messages)",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
