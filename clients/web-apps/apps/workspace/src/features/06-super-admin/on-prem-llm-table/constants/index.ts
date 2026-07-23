import { CrudActionType } from "@avplatform/ui/types";

const ONPREM_LLM_QUERY_KEY = ["on_prem_llm"];

const TABLE_HEADING = "On-prem Models";

const TABLE_KEY = "on-prem-llms";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Add Model", description: "" };
    case "read":
      return { heading: "Model", description: "" };
    case "update":
      return { heading: "Edit Model", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export { ONPREM_LLM_QUERY_KEY, TABLE_HEADING, TABLE_KEY, getDialogHeadingDescription };
