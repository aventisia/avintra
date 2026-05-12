import { getModels } from "../apis/models-apis";

export async function generateOutputConfigFromData() {
  const response = await getModels();
  const data = response.data;

  const inputItem = [
    {
      direction: "Input",
      type: "text",
      name: "inputText",
      label: "Input Text",
      description: "Enter the text to be processed.",
      defaultValue: "",
      required: true,
      renderIf: {
        conditions: [
          {
            field: "MLModel",
            notEquals: "",
          },
        ],
      },
    },
    {
      direction: "Input",
      type: "text",
      name: "modelApiKey",
      label: "Model API Key",
      description:
        "Enter the API key required to authenticate requests to the selected ML model.",
      defaultValue: "",
      required: true,
      renderIf: {
        conditions: [
          {
            field: "MLModel",
            notEquals: "",
          },
        ],
      },
    },
  ];

  const outputItems = data.map((item) => ({
    direction: "Output",
    type: "config-panel-model-output",
    name: item.name,
    label: item.type,
    description: item.id,
    defaultValue: {
      value: item.type,
      enabled: true,
    },
    renderIf: {
      conditions: [
        {
          field: "MLModel",
          equals: item.id,
        },
      ],
    },
  }));

  const llmItems = data.map((item) => ({
    direction: "Input",
    type: "text",
    name: "llmKey" + item.name,
    label: "LLM",
    description: "LLM used for selected model",
    defaultValue: item.llm,
    disabled: true,
    required: false,
    renderIf: {
      conditions: [
        {
          field: "MLModel",
          equals: item.id,
        },
      ],
    },
  }));

  return [
    {
      direction: "Input",
      type: "model-select",
      name: "MLModel",
      label: "Select Model",
      description: "Select the ML model.",
      defaultValue: "",
      required: true,
    },
    ...llmItems,
    ...inputItem,
    ...outputItems,
  ];
}
