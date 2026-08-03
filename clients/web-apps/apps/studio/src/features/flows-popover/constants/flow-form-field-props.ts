import { FlowTypesEnum } from "@avplatform/ui/enums";
import { InputFieldProps } from "@avplatform/ui/form";
import { SelectFieldProps } from "@avplatform/ui/form";
import { SwitchFieldProps } from "@avplatform/ui/form";
import { TextareaFieldProps } from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

// Agent Id
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
  description: "Disable this record if it's been outdated, or not required anymore",
};

export { descriptionProps, idProps, isDisabledProps, nameProps, typeProps };
