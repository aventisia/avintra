import { ActionCategoryType } from "../types/action-category-type";

export const countActions = (categories: ActionCategoryType[]) =>
  categories.reduce(
    (total, category) => total + (category.actions?.filter((action) => !action.hidden).length ?? 0),
    0,
  );
