import { ProjectTypesEnum } from "@/react-toolkit/enums/project-types-enum";
import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectFieldProps } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchFieldProps } from "@/react-toolkit/ui/form/fields/SwitchField";
import { TextareaFieldProps } from "@/react-toolkit/ui/form/fields/TextareaField";
import { enumToArray } from "@/react-toolkit/utils/enum-to-array";

// Project Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Project Id",
  disabled: true,
};

// What are you building today? - Only create mode
const typeOnCreateProps: SelectFieldProps = {
  name: "type",
  label: "What are you building today?",
  isRequired: true,
  selectOptions: enumToArray(ProjectTypesEnum),
};

// Project Type - Only view/edit mode
const typeProps: SelectFieldProps = {
  name: "type",
  label: "Project Type",
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

export {
  descriptionProps,
  idProps,
  isDisabledProps,
  nameProps,
  typeProps,
  typeOnCreateProps,
};
