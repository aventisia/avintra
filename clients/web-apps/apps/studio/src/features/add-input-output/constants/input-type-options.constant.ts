import {
  CaretCircleDownIcon,
  type Icon,
  PasswordIcon,
  TextTIcon,
  ToggleRightIcon,
} from "@phosphor-icons/react";

import type { FieldItemFormValues } from "./inputs-outputs-zod-schema";

type InputTypeOption = {
  value: FieldItemFormValues["type"];
  title: string;
  Icon: Icon;
};

export const INPUT_TYPE_OPTIONS: InputTypeOption[] = [
  { value: "text", title: "Text", Icon: TextTIcon },
  { value: "password", title: "Password", Icon: PasswordIcon },
  { value: "select", title: "Dropdown", Icon: CaretCircleDownIcon },
  { value: "switch", title: "Toggle", Icon: ToggleRightIcon },
];
