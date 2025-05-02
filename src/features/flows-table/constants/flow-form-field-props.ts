import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";

import { InputFieldProps } from "@aventisia/ui/form";
import { SelectFieldProps } from "@aventisia/ui/form";
import { SwitchFieldProps } from "@aventisia/ui/form";
import { TextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

// Flow Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Flow Id",
  disabled: true,
};

// Type
const typeProps: SelectFieldProps = {
  name: "type",
  label: "Type",
  isRequired: true,
  selectOptions: enumToArray(FlowTypesEnum),
};

// Name
const nameProps: InputFieldProps = {
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
