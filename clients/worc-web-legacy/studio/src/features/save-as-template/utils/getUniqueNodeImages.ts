import { NodeDataType } from "@/types/node-data-type";

import { Node } from "@xyflow/react";

const DEFAULT_IMAGE = "/function.png";
const TRIGGER_ICON = "ManualTriggerIcon";
/**
 * Returns a list of unique image paths used in the flow.
 *
 * - Picks `icon` first (added Icon in assets of worc ).
 * - Falls back to `img` if no icon is set.
 * - Skips the default `/function.png` image.
 */
export function getUniqueFlowImages(nodes: Node<NodeDataType>[]): string[] {
  const imageSet = new Set<string>();

  for (const node of nodes) {
    let imagePath: string | null = null;

    if (node.data?.icon && node.data?.icon !== TRIGGER_ICON) {
      imagePath = `/assets/${node.data.icon}.svg`;
    } else if (node.data?.img) {
      imagePath = node.data.img;
    } else if (node.type == "modelNode") {
      imagePath = `/brand-img/${node.data.label}.svg`;
    }

    if (imagePath && imagePath !== DEFAULT_IMAGE) {
      imageSet.add(imagePath);
    }
  }

  return Array.from(imageSet);
}
