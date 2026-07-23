import type { SelectFieldProps, TextareaFieldProps } from "@avplatform/ui/form";
import { InputFieldProps, SwitchFieldProps } from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

import { QueueViewTypeEnum } from "../enums/queue-view-type-enum";

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
  description: "Disable this record if it's been outdated, or not required anymore",
};

// Type
export const typeProps: SelectFieldProps = {
  name: "type",
  label: "Instance Type",
  isRequired: true,
  selectOptions: [
    { label: "Agent", value: "Agent" },
    { label: "User", value: "User" },
  ],
};

export const viewTypeProps: SelectFieldProps = {
  name: "viewType",
  label: "Queue Type",
  isRequired: true,
  selectOptions: enumToArray(QueueViewTypeEnum),
  defaultValue: QueueViewTypeEnum.DocumentProcessing,
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
};

export const inputJsonSchemaProps: InputFieldProps = {
  name: "specificDataSchemaFile",
  label: "Specific Data Json Schema",
};

export const outputJsonSchemaProps: InputFieldProps = {
  name: "outputDataSchemaFile",
  label: "Output Data Json Schema",
};
