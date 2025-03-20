import { FlowTypesEnum } from '@/react-toolkit/enums/flow-types-enum';
import { InputFieldProps } from '@/react-toolkit/ui/form/fields/InputField';
import { SwitchFieldProps } from '@/react-toolkit/ui/form/fields/SwitchField';
import { TextareaFieldProps } from '@/react-toolkit/ui/form/fields/TextareaField';
import { enumToArray } from '@/react-toolkit/utils/enum-to-array';

import type { SelectFieldProps } from '@/react-toolkit/ui/form/fields/SelectField';
// License Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "License Id",
  disabled: true,
};

// Type
export const typeProps: SelectFieldProps = {
  name: "type",
  label: "License Type",
  isRequired: true,
  selectOptions: enumToArray(FlowTypesEnum),
};

// Name
export const nameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  isRequired: true,
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
  description:
    "Disable this record if it's been outdated, or not required anymore",
}