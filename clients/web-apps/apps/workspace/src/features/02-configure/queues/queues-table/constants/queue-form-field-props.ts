import type { SelectFieldProps, TextareaFieldProps } from "@avplatform/ui/form";
import { InputFieldProps, SwitchFieldProps } from "@avplatform/ui/form";

import { QueueProcessingModeEnum } from "../enums/queue-processing-mode-enum";

// queue Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Queue ID",
  disabled: true,
};

// Name
export const nameProps: InputFieldProps = {
  name: "name",
  label: "Unique name",
  isRequired: true,
  description:
    "A **unique**, descriptive name for the queue.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** letters (a-z, A-Z), numbers (0-9), underscore (`_`), hyphen (`-`) and space.\n- **Cannot be changed** after creation.",
};

// Is Disabled
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable record",
  description: "Disable this record if it's been outdated, or not required anymore",
};

// Type
export const typeProps: SelectFieldProps = {
  name: "type",
  label: "Instance type",
  isRequired: true,
  description:
    "Choose who processes items from this queue:\n\n- **Agent** — items are processed by an agent.\n- **User** — items are processed by a user.",
  selectOptions: [
    { label: "Agent", value: "Agent" },
    { label: "User", value: "User" },
  ],
};

export const processingModeProps: SelectFieldProps = {
  name: "processingMode",
  label: "Processing mode",
  isRequired: true,
  description:
    "How items are picked for processing:\n\n- **Flexible** — items can be picked in any order.\n- **Fifo** — items are processed in first-in, first-out order.",
  selectOptions: [
    { label: "Flexible", value: QueueProcessingModeEnum.Manual },
    { label: "Fifo", value: QueueProcessingModeEnum.Fifo },
  ],
  defaultValue: QueueProcessingModeEnum.Manual,
};

// Description
export const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  description: "A short summary of what the queue is used for.",
  className: "min-h-[6rem]",
};

export const maxRetriesProps: InputFieldProps = {
  name: "maximumRetryAttempts",
  label: "Max of retries",
  description: "The maximum number of times an item can be retried.",
  type: "number",
  min: 0,
  max: 10,
  step: 1,
};

export const inputJsonSchemaProps: InputFieldProps = {
  name: "specificDataSchemaFile",
  label: "Specific data JSON schema",
  description: "A JSON schema describing the expected input data for items.",
};

export const outputJsonSchemaProps: InputFieldProps = {
  name: "outputDataSchemaFile",
  label: "Output data JSON schema",
  description: "A JSON schema describing the output data produced by processing items.",
};
