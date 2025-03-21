import { FlowTypesEnum } from '@/react-toolkit/enums/flow-types-enum';
import { InputFieldProps } from '@/react-toolkit/ui/form/fields/InputField';
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

// Name
export const quantityProps: InputFieldProps = {
  name: "quantity",
  label: "New Allocated Units",
  isRequired: true,
};
