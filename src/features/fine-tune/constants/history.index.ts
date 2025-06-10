import { CrudActionType } from "@aventisia/ui/types";


const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Re-Schedule Fine-tuning", description: "" };
    case "read":
      return { heading: "View Fine-tuning", description: "" };
    case "update":
      return { heading: "Edit Fine-tuning", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  getDialogHeadingDescription,
};
