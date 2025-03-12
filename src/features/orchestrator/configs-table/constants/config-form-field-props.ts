import { AccessLevelTypesEnum } from "@/react-toolkit/enums/access-level-types-enum";
import { ConfigItemTypesEnum } from "@/react-toolkit/enums/config-item-types-enum";
import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectFieldProps } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchFieldProps } from "@/react-toolkit/ui/form/fields/SwitchField";
import { TextareaFieldProps } from "@/react-toolkit/ui/form/fields/TextareaField";
import { enumToArray } from "@/react-toolkit/utils/enum-to-array";

// Config Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Config Id",
  disabled: true,
};

// Config Type - Only view/edit mode
const typeProps: SelectFieldProps = {
  name: "type",
  label: "Config Type",
  isRequired: true,
  selectOptions: enumToArray(ConfigItemTypesEnum),
};

// acceses level
const accessLevelProps: SelectFieldProps = {
  name: "accessLevel",
  label: "Access Level",
  isRequired: true,
  selectOptions: enumToArray(AccessLevelTypesEnum),
};

// Name
const nameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  isRequired: true,
};

// value
const valueOptionProps: TextareaFieldProps = {
  name: "value",
  label: "Value",
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
  valueOptionProps,
  idProps,
  isDisabledProps,
  nameProps,
  typeProps,
  accessLevelProps,
};
