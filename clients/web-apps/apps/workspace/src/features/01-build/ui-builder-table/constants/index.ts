import { DialogCrudAction } from "@avplatform/ui/types";

const UI_BUILDER_QUERY_KEY = ["ui-builder"];

const TABLE_HEADING = "UI Builder";

const TABLE_KEY = "ui-builder";

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create UI Builder Project", description: "" };
    case "read":
      return { heading: "UI Builder Project", description: "" };
    case "update":
      return { heading: "Edit UI Builder Project", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export { UI_BUILDER_QUERY_KEY, TABLE_HEADING, TABLE_KEY, getDialogHeadingDescription };
