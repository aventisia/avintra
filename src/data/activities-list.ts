import { ActivityNodeDataType } from "@/types/ActivityNodeDataType";
import { Position } from "@xyflow/react";

export const activitiesList: ActivityNodeDataType[] = [
  {
    type: "activity",
    category: "Email",
    name: "sendEmail",
    label: "Send email",
    description: "To send bluk email at any time",
    icon: `${import.meta.env.BASE_URL}sample-slack-new-logo.svg`,
    sourcePosition: Position.Bottom,
  },
  {
    type: "activity",
    category: "Flow",
    name: "createNewFlow",
    label: "Create new flow",
    description: "New flow can be created by just providing a name",
    icon: `${import.meta.env.BASE_URL}sample-google_g_logo.svg`,
    sourcePosition: Position.Bottom,
  },
];
