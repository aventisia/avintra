import type { CrudActionType } from "@/react-toolkit/types/literal-types";

/**
 * The column used for searching in the agents.
 */
export const SEARCH_COLUMN = "name";

export const DATA_QUERY_KEY = ["agents"];


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
