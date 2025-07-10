import { ISelectOption } from "@aventisia/ui/types";

const FLOWS_USER_KEY = "flow-user";

const selectOptions: ISelectOption[] = [
  { label: "Can edit", value: "Editor", description: "Make any changes" },
  { label: "Can view", value: "Viewer", description: "Can't make changes" },
];

export { FLOWS_USER_KEY, selectOptions };
