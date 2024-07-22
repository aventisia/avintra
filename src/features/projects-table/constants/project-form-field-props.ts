import {
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
  TextareaFieldProps,
} from "@/react-toolkit/components/form";
import { ProjectTypesEnum } from "@/react-toolkit/enums/project-types-enum";
import { enumToArray } from "@/react-toolkit/utils/enum-to-array";

// Project Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Project Id",
  disabled: true,
};

// Type
const typeProps: SelectFieldProps = {
  name: "type",
  label: "Type",
  isRequired: true,
  selectOptions: enumToArray(ProjectTypesEnum),
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

export { idProps, typeProps, nameProps, descriptionProps, isDisabledProps };
