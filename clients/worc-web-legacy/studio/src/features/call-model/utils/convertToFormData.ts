import { NodeDataType } from "@/types/node-data-type";
import { modelFormData } from "../constants/model-config-zod-schema";

export const convertToFormData = (data: NodeDataType): modelFormData => {
  const formData: Partial<modelFormData> = {};
  if (data?.inputs)
    // Reconstruct inputs
    for (const input of data.inputs) {
      switch (input.key) {
        case "InputText":
          formData.inputText = input.value as string;
          break;
        case "ModelApiKey":
          formData.modelApiKey = input.value as string;
          break;
        case "RequestBody":
          // optional: extract more from here if needed
          break;
      }
    }
  if (data?.outputs)
    // Reconstruct outputs
    for (const output of data.outputs) {
      if (output.key === "AIModelResult") {
        formData.AIModelResult = {
          value: output.value.value,
          enabled: output.value.enabled,
        };
      } else if (output.key === "ResponseCode") {
        formData.ResponseCode = {
          value: output.value.value,
          enabled: output.value.enabled,
        };
      }
    }

  return formData as modelFormData;
};
