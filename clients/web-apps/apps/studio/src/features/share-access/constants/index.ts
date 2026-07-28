import { ISelectOption } from "@avplatform/ui/types";

const FLOWS_USER_KEY = "flow-user";

const selectOptions: ISelectOption[] = [
  { label: "Can edit", value: "Edit", description: "Make any changes" },
  { label: "Can view", value: "View", description: "Can't make changes" },
];

export { FLOWS_USER_KEY, selectOptions };
