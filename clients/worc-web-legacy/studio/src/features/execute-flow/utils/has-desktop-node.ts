import { NodeDataType } from "@/types/node-data-type";

import { Node } from "@xyflow/react";

export const hasWindowsOnlySupportedNode = (
  nodes: Node<NodeDataType>[],
): boolean => {
  for (const node of nodes) {
    const platforms = node.data?.supportedPlatforms;
    if (platforms?.length === 1 && platforms[0] === "windows") {
      return true;
    }
  }
  return false;
};
