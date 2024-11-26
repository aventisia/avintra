import { NodeDataType } from "@/types/node-data-type";

export const runFlowActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "runDesktopFlow",
    label: "Run desktop flow",
    description:
      "Runs a desktop flow that can receive input variables and might produce output variables. The parent flow run will be paused until the called desktop flow completes",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
