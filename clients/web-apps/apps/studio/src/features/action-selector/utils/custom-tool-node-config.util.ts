import { isBodyCapableMethod } from "@avplatform/ui/utils";

import { UsableToolOperation } from "@/features/dynamic-config-panel/dtos/tool.dto";
import { DCPFieldSchemaType } from "@/features/dynamic-config-panel/types/dcp-field-schema-type";
import { NodeConfigSchemaType } from "@/features/dynamic-config-panel/types/node-config-schema-type";

import {
  CustomToolNodeReference,
  formatOperationId,
  parseCustomToolNodeReference,
} from "./custom-tool-node-name.util";

export const CUSTOM_TOOL_CREDENTIAL_FIELD = "__CredentialName__CustomApiTool";

export const CUSTOM_TOOL_HEADERS_FIELD = "Headers";

export const CUSTOM_TOOL_PARAMETERS_FIELD = "Parameters";

export const CUSTOM_TOOL_REQUEST_PAYLOAD_FIELD = "RequestPayload";

const sampleValueForType = (type?: string): unknown => {
  switch ((type ?? "string").toLowerCase()) {
    case "number":
    case "integer":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object":
      return {};
    default:
      return "";
  }
};

const toSampleJson = (entries: { name?: string; type?: string }[]): string => {
  const named = entries.filter((entry) => entry.name);
  if (named.length === 0) return "";
  return JSON.stringify(
    Object.fromEntries(
      named.map((entry): [string, unknown] => [
        entry.name as string,
        sampleValueForType(entry.type),
      ]),
    ),
    null,
    2,
  );
};

const buildHeadersDefault = (operation?: UsableToolOperation): string => {
  const headerParameters = (operation?.parameters ?? []).filter(
    (parameter) => parameter.name && (parameter.in ?? "").toLowerCase() === "header",
  );
  return toSampleJson(headerParameters);
};

const buildParametersDefault = (operation?: UsableToolOperation): string => {
  const parameterEntries = (operation?.parameters ?? []).filter((parameter) => {
    if (!parameter.name) return false;
    const location = (parameter.in ?? "query").toLowerCase();
    return location === "path" || location === "query";
  });
  return toSampleJson(parameterEntries);
};

const buildRequestPayloadDefault = (operation?: UsableToolOperation): string => {
  if (!isBodyCapableMethod(operation?.method)) return "";
  return toSampleJson(operation?.requestBody?.properties ?? []);
};

/**
 * Builds the sample header, parameter and request-payload JSON defaults for a tool operation.
 */
export const buildSectionDefaults = (operation?: UsableToolOperation) => ({
  headersDefault: buildHeadersDefault(operation),
  parametersDefault: buildParametersDefault(operation),
  requestPayloadDefault: buildRequestPayloadDefault(operation),
});

/**
 * Builds the dynamic-config-panel schema for a custom-tool action node.
 */
export function buildCustomToolNodeConfig(
  nodeUniqueName: string,
  operation?: UsableToolOperation,
  reference: CustomToolNodeReference = parseCustomToolNodeReference(nodeUniqueName),
): NodeConfigSchemaType {
  const { toolName, operationId } = reference;

  const { headersDefault, parametersDefault, requestPayloadDefault } =
    buildSectionDefaults(operation);

  const fields: DCPFieldSchemaType[] = [
    {
      direction: "Input",
      type: "credentials-select",
      name: CUSTOM_TOOL_CREDENTIAL_FIELD,
      label: "Credential",
      description: `The ${toolName} credential used to authenticate the request.`,
      defaultValue: "",
    },
  ];

  const headersField: DCPFieldSchemaType = {
    direction: "Input",
    type: "json-editor",
    name: CUSTOM_TOOL_HEADERS_FIELD,
    label: "Headers",
    description: 'Additional request headers as a JSON object, e.g. { "X-Api-Key": "abc" }.',
    defaultValue: headersDefault,
  };
  const parametersField: DCPFieldSchemaType = {
    direction: "Input",
    type: "json-editor",
    name: CUSTOM_TOOL_PARAMETERS_FIELD,
    label: "Parameters",
    description: 'Path, query and header parameter values as a JSON object, e.g. { "id": "123" }.',
    defaultValue: parametersDefault,
  };
  const requestPayloadField: DCPFieldSchemaType = {
    direction: "Input",
    type: "json-editor",
    name: CUSTOM_TOOL_REQUEST_PAYLOAD_FIELD,
    label: "Request Payload",
    description: "JSON request body, sent with POST, PUT, PATCH and DELETE operations.",
    defaultValue: requestPayloadDefault,
  };

  if (operation) {
    if (headersDefault) fields.push(headersField);
    if (parametersDefault) fields.push(parametersField);
    if (requestPayloadDefault) fields.push(requestPayloadField);
  } else {
    fields.push(headersField, parametersField, requestPayloadField);
  }

  fields.push({
    direction: "Output",
    type: "config-panel-output",
    name: "Result",
    label: "Result",
    description: `The response returned by the ${operationId || "custom tool"} operation.`,
    defaultValue: { value: "Result", enabled: true },
  });

  return {
    name: nodeUniqueName,
    label:
      operation?.summary?.trim() ||
      (operationId ? formatOperationId(operationId) : "Custom Tool Action"),
    description:
      operation?.description?.trim() ||
      operation?.summary?.trim() ||
      "Executes a custom tool operation.",
    version: "1.0.0",
    supportedPlatforms: ["cloud", "windows"],
    errorHandling: "standard",
    testScreenType: "standard",
    fields,
  };
}
