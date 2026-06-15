import { LLMToolsOutputDto } from "../../av-platform-assistant-ui/dtos/execute-flow-response-dto";

type FieldType = "text" | "number" | "switch";

type PayloadField = {
  direction: "Input";
  type: FieldType;
  name: string;
  label: string;
  defaultValue: unknown;
};

function toTitleCase(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → camel Case
    .replace(/[_-]+/g, " ") // snake_case / kebab-case → spaces
    .replace(/\s+/g, " ") // remove extra spaces
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize each word
}
function getFieldType(value: unknown): FieldType {
  switch (typeof value) {
    case "boolean":
      return "switch";

    case "number":
      return "number";

    default:
      return "text";
  }
}

export function createPayloadFields(data: LLMToolsOutputDto[]): PayloadField[] {
  return data.flatMap((item) => {
    const payload = item.output?.payload;

    if (!payload) return [];

    return Object.entries(payload).map(([key, value]) => ({
      direction: "Input",
      type: getFieldType(value),
      name: key,
      label: toTitleCase(key),
      defaultValue: value,
    }));
  });
}
