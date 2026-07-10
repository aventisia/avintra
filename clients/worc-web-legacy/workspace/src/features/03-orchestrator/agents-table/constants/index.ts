import type { CrudActionType } from "@aventisia/ui/types";

export const TABLE_KEY = "agents-table";

export const DATA_QUERY_KEY = ["agents"];
export const CHAT_AGENT_USER_KEY = "chat-agent-user";

export const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "read":
      return { heading: "Agent", description: "" };
    case "update":
      return { heading: "Assign Machines", description: "" };
    default:
      return { heading: "", description: "" };
  }
};
