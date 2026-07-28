import { DCPFieldSchemaType } from "../types/dcp-field-schema-type";

export const onErrorFieldsJson: DCPFieldSchemaType[] = [
  {
    direction: "Input",
    type: "switch",
    name: "__OnError__EnableAutoRetry",
    label: "Enable Auto-Retry",
    description:
      "Automatically attempts to run the node again upon failure to bypass temporary network or service issues.",
    defaultValue: false,
    category: "OnError",
  },

  {
    direction: "Input",
    type: "text",
    name: "__OnError__RetryLimit",
    label: "Retry Limit",
    description:
      "The total number of times the system will attempt to run this node again after the initial failure. Once this limit is reached, the system will execute the rule defined in 'Fallback Behavior'",
    defaultValue: 3,
    category: "OnError",
    renderIf: {
      conditions: [
        {
          field: "__OnError__EnableAutoRetry",
          equals: true,
        },
      ],
    },
  },
  {
    direction: "Input",
    type: "text",
    name: "__OnError__WaitTimeBeforeRetryMs",
    label: "Wait Time Before Retry (ms)",
    description:
      "The delay, in milliseconds, before the system attempts the retry (e.g., 3000 = 3 seconds).",
    defaultValue: 3000,
    category: "OnError",
    renderIf: {
      conditions: [
        {
          field: "__OnError__EnableAutoRetry",
          equals: true,
        },
      ],
    },
  },
  {
    direction: "Input",
    type: "select",
    name: "__OnError__FallbackBehavior",
    label: "Fallback Behavior",
    description:
      "Determines the routing behavior of the overall flow when this node completely fails and all retry (if auto-retry is enabled) attempts have been exhausted.",
    defaultValue: "abort",
    category: "OnError",
    selectOptions: [
      {
        label: "Abort Execution",
        value: "abort",
        description: "Stops the entire flow immediately and marks it as failed",
      },
      {
        label: "Continue to Next Node",
        value: "next-node",
        description:
          "Moves forward despite the failure. Ensure subsequent steps do not strictly require this node's successful output.",
      },
    ],
  },
];
