import { NodeDataType } from "@/types/node-data-type";

/**
 * Represents a action Category for list of actions.
 */
export type ActionCategoryType = {
  /** The unique name of the action category. */
  name: string;

  /** The display label for the action category. */
  label: string;
  
  /** A brief description of the action category. */
  description: string;
  
  /** The icon associated with the action category. */
  icon?: string;
  
  /** The image associated with the action category. */
  img?: string;

  /** The list of actions associated with the action category. */
  actions?: NodeDataType[];
};
