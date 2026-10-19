// IMPORTANT NOTE: the runtime executor and the node-config loader route on this node-name prefix, so it is part of the persisted node identity and must not change without a migration.
export const CUSTOM_TOOL_NODE_PREFIX = "CustomTool/";

/**
 * Builds the unique node name for a tool operation: "CustomTool/{toolName}.{operationId}".
 */
export function getCustomToolNodeName(toolName: string, operationId: string): string {
  return `${CUSTOM_TOOL_NODE_PREFIX}${toolName}.${operationId}`;
}

/**
 * Formats an OpenAPI operationId into a human-readable label.
 */
export function formatOperationId(operationId: string): string {
  if (!operationId) return "Untitled action";
  return operationId
    .replace(/[._/-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export type CustomToolNodeReference = {
  toolName: string;
  operationId: string;
};

/**
 * Splits a custom-tool node name at each of its dots into candidate tool/operation pairs,
 * longest tool name first, mirroring the backend action resolution.
 */
export function getCustomToolNodeReferenceCandidates(
  nodeUniqueName: string,
): CustomToolNodeReference[] {
  const reference = nodeUniqueName.startsWith(CUSTOM_TOOL_NODE_PREFIX)
    ? nodeUniqueName.slice(CUSTOM_TOOL_NODE_PREFIX.length)
    : nodeUniqueName;

  const candidates: CustomToolNodeReference[] = [];
  for (
    let separatorIndex = reference.lastIndexOf(".");
    separatorIndex > 0;
    separatorIndex = reference.lastIndexOf(".", separatorIndex - 1)
  ) {
    const operationId = reference.slice(separatorIndex + 1);
    if (operationId.length > 0) {
      candidates.push({ toolName: reference.slice(0, separatorIndex), operationId });
    }
  }
  return candidates;
}

/**
 * Splits a custom-tool node name into its tool reference and operation id at its last dot.
 */
export function parseCustomToolNodeReference(nodeUniqueName: string): CustomToolNodeReference {
  const [candidate] = getCustomToolNodeReferenceCandidates(nodeUniqueName);
  return (
    candidate ?? {
      toolName: nodeUniqueName.startsWith(CUSTOM_TOOL_NODE_PREFIX)
        ? nodeUniqueName.slice(CUSTOM_TOOL_NODE_PREFIX.length)
        : nodeUniqueName,
      operationId: "",
    }
  );
}
