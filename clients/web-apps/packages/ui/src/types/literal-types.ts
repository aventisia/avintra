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
type CrudActionType = "create" | "read" | "update" | "delete" | "delete-multiple";

/**
 * CRUD action types valid for opening a dialog (excludes delete actions).
 */
type DialogCrudAction = "create" | "read" | "update";

/**
 * Known entity keys that can be rendered by the global URL-driven CRUD dialog.
 * Add new entities here and register their Content component in the workspace
 * CrudDialogProvider registry to keep type safety.
 */
type CrudEntityKey =
  | "machine"
  | "job"
  | "flow"
  | "queue"
  | "configstore"
  | "knowledgeBase"
  | "skill"
  | "tool"
  | "vault"
  | "emailTrigger"
  | "messageTrigger"
  | "timeTrigger"
  | "webhookTrigger"
  | "creditPlan"
  | "subscriptionPlan"
  | "tenant"
  | "supportTicket"
  | "ticket"
  | "saSupportTicket"
  | "onPremTenant"
  | "tenantInstance"
  | "user"
  | "role"
  | "apiKey"
  | "space"
  | "notification"
  | "saNotification";

/**
 * Represents the type for specifying the order by which to sort data.
 * The value can be either "asc" for ascending order or "desc" for descending order.
 * Use this type when you need to specify the sorting order of data, such as in database queries or sorting functions.
 */
type OrderByType = "asc" | "desc";

export type { AlignType, CrudActionType, CrudEntityKey, DialogCrudAction, OrderByType };
