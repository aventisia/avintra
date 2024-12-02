import { NodeDataType } from "@/types/node-data-type";

export const emailActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "retrieveEmailMessages",
    label: "Retrieve email messages",
    description: "Retrieves email messages from an IMAP server",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "processEmailMessages",
    label: "Process email messages",
    description:
      "Moves, deletes or marks as unread an email (or a list of emails) retrieved by a Retrieve emails action",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "sendEmail",
    label: "Send email",
    description: "Creates and sends a new email message",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
