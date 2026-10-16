import type { DialogCrudAction } from "@avplatform/ui/types";

export const TABLE_KEY = "agents-table";

export const DATA_QUERY_KEY = ["agents"];
export const CHAT_AGENT_USER_KEY = "chat-agent-user";
export const UI_BUILDER_QUERY_KEY = ["ui-builder"];
export const MY_INTERFACES_QUERY_KEY = ["my-interfaces"];
export const PUBLISHED_UI_USER_KEY = "published-ui-user";

export const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "read":
      return { heading: "Agent", description: "" };
    case "update":
      return { heading: "Assign Machines", description: "" };
    default:
      return { heading: "", description: "" };
  }
};
