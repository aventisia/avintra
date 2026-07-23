export enum QueueTransactionEventEnum {
  CommentAdded = "CommentAdded",

  StatusChange = "StatusChange",

  Closed = "Closed",

  QueueTransactionRouted = "QueueTransactionRouted",

  // TODO: Add future queue transaction events to this enum as needed.
  CommentRemoved = "CommentRemoved",

  CommentUpdated = "CommentUpdated",

  DescriptionUpdated = "DescriptionUpdated",

  AttachmentAdded = "AttachmentAdded",

  AttachmentRemoved = "AttachmentRemoved",

  AssignedUserChanged = "AssignedUserChanged",

  QueueTransactionCompleted = "QueueTransactionCompleted",

  QueueTransactionCreated = "QueueTransactionCreated",

  QueueTransactionReopened = "QueueTransactionReopened",
}
