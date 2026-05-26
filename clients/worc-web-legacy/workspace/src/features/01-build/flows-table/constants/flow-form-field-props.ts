import {
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
  TextareaFieldProps,
} from "@aventisia/ui/form";

import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";

// Flow Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Agent Id",
  disabled: true,
};

// Type
const typeProps: SelectFieldProps = {
  name: "type",
  label: "Type",
  isRequired: true,
  selectOptions: [
    {
      label: "Automation Agent",
      value: FlowTypesEnum.Agent,
      description:
        "A flow designed to automate tasks and processes, capable of performing actions based on predefined rules and logic",
    },
    {
      label: "Chat Agent",
      value: FlowTypesEnum.ChatAgent,
      description:
        "A specialized agent flow designed for handling chat interactions, enabling dynamic and context-aware conversations",
    },
    {
      label: "Block",
      value: FlowTypesEnum.Block,
      description: "A reusable flow component that can be called within agents",
    },
  ],
};

// Name
const nameProps: InputFieldProps = {
  autoFocus: true,
  name: "name",
  label: "Name",
  isRequired: true,
};

// Description
const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  className: "min-h-[6rem]",
};

// Is Disabled
const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  description:
    "Disable this record if it's been outdated, or not required anymore",
};

export { descriptionProps, idProps, isDisabledProps, nameProps, typeProps };
