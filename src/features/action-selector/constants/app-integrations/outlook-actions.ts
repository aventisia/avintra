import { NodeDataType } from "@/types/node-data-type";

export const outlookActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "launchOutlook",
    label: "Launch Outlook",
    description: "Launch Outlook and create a new Outlook instance",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "retrieveEmailMessagesFromOutlook",
    label: "Retrieve email messages from Outlook",
    description: "Retrieve email messages from an Outlook account",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "sendEmailThroughOutlook",
    label: "Send email through Outlook",
    description: "Create and send a new email message through Outlook",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "processEmailMessagesInOutlook",
    label: "Process email messages in Outlook",
    description:
      "Move or deletes an email (or a list of email messages) retrieved by a 'Retrieve emails from Outlook' action",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "saveOutlookEmailMessages",
    label: "Save Outlook email messages",
    description: "Save Outlook email messages given an account",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "respondToOutlookMailMessage",
    label: "Respond to Outlook mail message",
    description:
      "Respond to an Outlook message, by replying, replying to all or forwarding it",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "closeOutlook",
    label: "Close Outlook",
    description: "Close a previously launched Outlook instance",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
