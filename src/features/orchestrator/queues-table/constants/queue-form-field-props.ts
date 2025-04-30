import { InputFieldProps } from "@aventisia/ui/form";
import { SwitchFieldProps } from "@aventisia/ui/form";
import type { TextareaFieldProps } from "@aventisia/ui/form";

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
  placeholder: "exampleQueue",
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
  name: "maximumRetryAttempts",
  label: "Max Of Retries",
  isRequired: true,
};

export const inputJsonSchemaProps: InputFieldProps = {
  name: "specificDataSchemaFile",
  label: "Specific Data Json Schema",
  isRequired: true,
};

export const outputJsonSchemaProps: InputFieldProps = {
  name: "outputDataSchemaFile",
  label: "Output Data Json Schema",
  isRequired: true,
};
