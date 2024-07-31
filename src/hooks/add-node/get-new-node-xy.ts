import { Position, XYPosition } from "@xyflow/react";

/**
 * Calculates the new X and Y position for a new node based on the selected node's position and the source position.
 *
 * @param selectedNodeXY - The X and Y position of the selected node.
 * @param selctedNodeWidth - The width of the selected node.
 * @param selectedNodeHeight - The height of the selected node.
 * @param sourcePosition - The position of the source relative to the selected node ("top", "right", "bottom", or "left").
 * @returns The new X and Y position for the new node.
 */
export const getNewNodeXY = (
  selectedNodeXY: XYPosition,
  selctedNodeWidth: number,
  selectedNodeHeight: number,
  sourcePosition: Position,
) => {
  // Extra X, Y to add/subtract to the selected node position
  const extraX = selctedNodeWidth + 80;
  const extraY = selectedNodeHeight + 80;

  // New node X, Y position
  switch (sourcePosition) {
    case "top":
      return { x: selectedNodeXY?.x, y: selectedNodeXY?.y - extraY };
    case "right":
      return { x: selectedNodeXY?.x + extraX, y: selectedNodeXY?.y };
    case "bottom":
      return { x: selectedNodeXY?.x, y: selectedNodeXY?.y + extraY };
    case "left":
      return { x: selectedNodeXY?.x - extraX, y: selectedNodeXY?.y };
  }

  // Return default position
  return { x: 0, y: 0 };
};
