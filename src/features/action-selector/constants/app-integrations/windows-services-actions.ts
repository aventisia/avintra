import { NodeDataType } from "@/types/node-data-type";

export const windowsServicesActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "ifService",
    label: "If service",
    description:
      "Marks the beginning of a conditional block of actions depending on whether a service is running, paused, stopped or installed on the computer",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "waitForService",
    label: "Wait for service",
    description:
      "Suspend the execution of the automation until a service is running, paused or stopped on the computer",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "startService",
    label: "Start service",
    description: "Start a stopped Windows service",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "stopService",
    label: "Stop service",
    description: "Stop a running Windows service",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "pauseService",
    label: "Pause service",
    description: "Pause a running Windows service",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "resumeService",
    label: "Resume service",
    description: "Resume a paused Windows service",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
