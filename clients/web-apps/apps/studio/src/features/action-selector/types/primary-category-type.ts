import { ActionCategoryType } from "./action-category-type";

/**
 * Represents a primary category with its associated properties.
 */
export type PrimaryCategoryType = {
  /** The display label for the primary category. */
  label: string;

  /** A brief description of the primary category. */
  description: string;

  /** The icon associated with the primary category. */
  icon?: string;

  /** The image associated with the primary category. */
  img?: string;

  /** Whether the primary category is currently unavailable (e.g. "coming soon"). */
  disabled?: boolean;

  /** The list of action categories associated with the primary category. */
  actionCategories: ActionCategoryType[];
};
