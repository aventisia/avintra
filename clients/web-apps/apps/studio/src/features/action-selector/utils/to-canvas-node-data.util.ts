import { NodeDataType } from "@/types/node-data-type";

import { useNodeSelectorStore } from "../stores/action-selector-store";

type CatalogOwnedFields = { description?: string; docsLink?: string };

/**
 * Drops the catalog-owned subtitle and docs link so only canvas node data is saved.
 * Nodes outside the action catalog (triggers, custom tools, structural nodes with
 * hardcoded text) keep their own description.
 */
export const toCanvasNodeData = (data: NodeDataType & CatalogOwnedFields): NodeDataType => {
  const catalogNames = new Set(
    useNodeSelectorStore
      .getState()
      .actionSelectorData.flatMap((primary) =>
        primary.actionCategories.flatMap((category) =>
          (category.actions ?? []).map((action) => action.name),
        ),
      ),
  );
  if (!catalogNames.has(data.name)) return { ...data };

  const canvasData = { ...data };
  delete canvasData.description;
  delete canvasData.docsLink;
  return canvasData;
};
