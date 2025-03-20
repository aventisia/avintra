import { InputFieldProps } from '@/react-toolkit/ui/form/fields/InputField';
import { SwitchFieldProps } from '@/react-toolkit/ui/form/fields/SwitchField';

import type { TextareaFieldProps } from '@/react-toolkit/ui/form/fields/TextareaField';

// queue Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Queue Id",
  disabled: true,
};

// Name
export const nameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  isRequired: true,
};

// Is Disabled
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  description:
    "Disable this record if it's been outdated, or not required anymore",
};

// Description
export const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  className: "min-h-[6rem]",
};

export const maxRetriesProps: InputFieldProps = {
  name: "maxRetries",
  label: "Max Of Retries",
  isRequired: true,
};

export const inputJsonSchemaProps: InputFieldProps = {
  name: "inputJsonSchema",
  label: "Specific Data Json Schema",
  isRequired: true,
  type: "file",
};

export const outputJsonSchemaProps: InputFieldProps = {
  name: "outputJsonSchema",
  label: "Output Data Json Schema",
  isRequired: true,
  type: "file",
};