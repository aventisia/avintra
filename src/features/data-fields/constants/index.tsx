import { CrudActionType } from "@/react-toolkit/types/literal-types";
import { FilePenLine, LucideProps, Sheet, TypeOutline } from "lucide-react";

const addFieldDropdownList: {
  name: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}[] = [
  { name: "Field", icon: TypeOutline },
  { name: "Signature", icon: FilePenLine },
  { name: "Table", icon: Sheet },
];

/**
 * The unique key for the projects query to be used in the query client. ["projects"]
 */
const DATA_QUERY_KEY = ["dataFields"];

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Add field", description: "" };
    case "read":
      return { heading: "Data field", description: "" };
    case "update":
      return { heading: "Edit ", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export { addFieldDropdownList, DATA_QUERY_KEY, getDialogHeadingDescription };
