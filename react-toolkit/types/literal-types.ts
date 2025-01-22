/**
 * Represents the position type.
 * It can be one of the following values: "top", "right", "bottom", or "left".
 * Use this type when you need to specify the position of an element, such as in CSS or layout calculations.
 */
type PositionType = "top" | "right" | "bottom" | "left";

/**
 * Represents the alignment type for an element.
 * Possible values are "start", "center", and "end".
 * Use this type when you need to specify the alignment of an element, such as in CSS or layout calculations.
 */
type AlignType = "start" | "center" | "end";

/**
 * Represents the possible CRUD (Create, Read, Update, Delete) action types.
 * Use this type when you need to specify the type of CRUD action being performed, such as in API endpoints or function parameters.
 */
type CrudActionType =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "delete-multiple";

/**
 * Represents the type for specifying the order by which to sort data.
 * The value can be either "asc" for ascending order or "desc" for descending order.
 * Use this type when you need to specify the sorting order of data, such as in database queries or sorting functions.
 */
type OrderByType = "asc" | "desc";

/** Represents the size type for form fields. */
type FormFieldSizeType = "xs" | "sm" | "base";

export type {
  PositionType,
  AlignType,
  CrudActionType,
  OrderByType,
  FormFieldSizeType,
};
