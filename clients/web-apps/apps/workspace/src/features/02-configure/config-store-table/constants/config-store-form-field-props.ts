import { AccessLevelTypesEnum } from "@avplatform/ui/enums/access-level-types-enum";
import { ConfigStoreTypesEnum } from "@avplatform/ui/enums/config-store-types-enum";
import {
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
  TextareaFieldProps,
} from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

// Config store Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Key Id",
  disabled: true,
};

// Config store Type - Only view/edit mode
export const typeProps: SelectFieldProps = {
  name: "type",
  label: "Key Type",
  isRequired: true,
  description: "The type of key being stored (e.g. API key, JSON, etc.).",
  selectOptions: enumToArray(ConfigStoreTypesEnum),
};

// acceses level
export const accessLevelProps: SelectFieldProps = {
  name: "accessLevel",
  label: "Access Level",
  isRequired: true,
  description: "The access level for the key, controlling who can read or use it.",
  selectOptions: enumToArray(AccessLevelTypesEnum),
};

// Name
export const nameProps: InputFieldProps = {
  name: "name",
  label: "Unique Name",
  isRequired: true,
  placeholder: "Enter a unique name",
  description:
    "A **unique** name for the key.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** letters (a-z, A-Z), numbers (0-9) and underscore (`_`). Must start with a letter or underscore. No spaces or other special characters.\n- **Cannot contain** `__config__`.\n- **Cannot be changed** after creation.",
};

// Name
export const valueProps: InputFieldProps = {
  name: "value",
  label: "Value",
  isRequired: true,
  description: "The key value (e.g. an API key or configuration value).",
};

// Name
export const tagsProps: InputFieldProps = {
  name: "tags",
  label: "Tags",
  isRequired: false,
  description: "Optional tags to help organize and find the key.",
};

// Description
export const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  description: "A short summary of what the key is used for.",
  className: "min-h-[6rem]",
};

// Is Disabled
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  description: "Disable this record if it's been outdated, or not required anymore",
};

// Is Disabled
export const isEncrypterProps: SwitchFieldProps = {
  name: "isEncrypted",
  label: "Encrypted",
  description: "No one can access this key, without the adder's credentials",
};
