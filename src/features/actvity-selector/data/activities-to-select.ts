import { ActivityNodeDataType } from "../types/ActivityNodeDataType";

export const activitiesList: ActivityNodeDataType[] = [
  {
    type: "trigger",
    name: "startFlow",
    label: "Flow trigger",
    description: "To trigger the flow, a starting point",
    icon: `${import.meta.env.BASE_URL}sample-slack-new-logo.svg`,
  },
  {
    type: "activity",
    name: "sendEmail",
    label: "Send email",
    description: "To send bluk email at any time",
    icon: `${import.meta.env.BASE_URL}sample-slack-new-logo.svg`,
  },
  {
    type: "activity",
    name: "createNewFlow",
    label: "Create new flow",
    description: "New flow can be created by just providing a name",
    icon: `${import.meta.env.BASE_URL}sample-google_g_logo.svg`,
  },
  {
    type: "if",
    name: "ifCondition",
    label: "If",
    description: "If logic",
    icon: `${import.meta.env.BASE_URL}sample-code_bracket.svg`,
  },
  {
    type: "activity",
    name: "activity-1",
    label: "Activity 1",
    description: "Activity 1 description",
    icon: `${import.meta.env.BASE_URL}sample-google_g_logo.svg`,
  },
  {
    type: "activity",
    name: "activity-2",
    label: "Activity 2",
    description: "Activity 2 description",
    icon: `${import.meta.env.BASE_URL}sample-google_g_logo.svg`,
  },
  {
    type: "activity",
    name: "activity-3",
    label: "Activity 3",
    description: "Activity 3 description",
    icon: `${import.meta.env.BASE_URL}sample-google_g_logo.svg`,
  },
];
