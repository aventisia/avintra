import { AccessLevelTypesEnum } from "@avplatform/ui/enums/access-level-types-enum";
import { KeyStoreTypesEnum } from "@avplatform/ui/enums/key-store-types-enum";
import {
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
  TextareaFieldProps,
} from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

// Keystore Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Key Id",
  disabled: true,
};

// Keystore Type - Only view/edit mode
export const typeProps: SelectFieldProps = {
  name: "type",
  label: "Key Type",
  isRequired: true,
  selectOptions: enumToArray(KeyStoreTypesEnum),
};

// acceses level
export const accessLevelProps: SelectFieldProps = {
  name: "accessLevel",
  label: "Access Level",
  isRequired: true,
  selectOptions: enumToArray(AccessLevelTypesEnum),
};

// Name
export const nameProps: InputFieldProps = {
  name: "name",
  label: "Name (Cannot be edited after creation)",
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
};

// Name
export const tagsProps: InputFieldProps = {
  name: "tags",
  label: "Tags",
  isRequired: false,
};

// Description
export const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
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
