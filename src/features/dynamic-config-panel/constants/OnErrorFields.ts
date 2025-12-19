import { DCPFieldSchemaType } from "../types/dcp-field-schema-type";

export const onErrorFieldsJson: DCPFieldSchemaType[] = [
  {
    direction: "Input",
    type: "switch",
    name: "RetryOnFail",
    label: "Retry On Fail",
    description: "",
    defaultValue: false,
    required: false,
    category: "OnError",
  },

  {
    direction: "Input",
    type: "text",
    name: "MaxTries",
    label: "Maximum Tries",
    description: "The number of to try of node fails.",
    defaultValue: "",
    required: false,
    renderIf: {
      conditions: [
        {
          field: "RetryOnFail",
          equals: true,
        },
      ],
    },

    category: "OnError",
  },
  {
    direction: "Input",
    type: "text",
    name: "WaitBetweenTires",
    label: "Wait Between Tires",
    description: "The waiting time between two tries.",
    defaultValue: "",
    required: false,
    renderIf: {
      conditions: [
        {
          field: "RetryOnFail",
          equals: true,
        },
      ],
    },

    category: "OnError",
  },

  {
    direction: "Input",
    type: "select",
    name: "On Error",
    label: "On Error",
    description: "Action to take if node fails.",
    defaultValue: "StopExecution",
    required: false,
    selectOptions: [
      {
        label: "Stop Execution",
        value: "StopExecution",
        description: "Halt execution and mark fail.",
      },
      {
        label: "Continue",
        value: "Continue",
        description: "Pass error message as item in regular output.",
      },
    ],

    category: "OnError",
  },
];
