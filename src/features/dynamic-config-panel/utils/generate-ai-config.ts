import { getModels } from "../apis/models-apis";

export async function generateOutputConfigFromData() {
  const response = await getModels();
  const data = response.data;

  const inputItem = {
    direction: "Input",
    type: "model-select",
    name: "MLModel",
    label: "Select Model",
    description: "Select the ML model.",
    defaultValue: "",
    required: true,
  };

  const outputItems = data.map((item) => ({
    direction: "Output",
    type: "config-panel-output",
    name: "ItemVariableName",
    label: item.type,
    description: `type:${item.type}\n \n id:${item.id}`,
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

  return [inputItem, ...outputItems];
}
