export enum ResourceAccessTypeEnum {
  Owner = "Owner", // View Edit delete
  FullAccess = "FullAccess", // View Edit delete
  View = "View", // View
  Create = "Create",
  Edit = "Edit", // View Edit
  Delete = "Delete", //View Delete
  Personal = "Personal", // Record created by the current user (ownership marker)
}
