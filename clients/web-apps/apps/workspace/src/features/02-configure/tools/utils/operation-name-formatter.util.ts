/** Formats an operation id for display: "openai.get.models" becomes "OPENAI_GET_MODELS". */
export const formatOperationName = (operationId: string): string =>
  operationId.replace(/\./g, "_").toUpperCase();
