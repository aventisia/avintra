import { NodeDataType } from "@/types/node-data-type";

import { DoNotRenderIfType } from "./do-not-render-type";

/**
 * Represents a action Category for list of actions.
 */
export type ActionCategoryType = {
  /** The display label for the action category. */
  label: string;

  /** A brief description of the action category. */
  description: string;

  /** The icon associated with the action category. */
  icon?: string;

  /** The image associated with the action category. */
  img?: string;

  listType?: "accordion" | "list";

  /** The list of actions associated with the action category. */
  actions?: NodeDataType[];

  /** Visibility rules (absence = visible everywhere) */
  doNotRenderIf?: DoNotRenderIfType;
};
