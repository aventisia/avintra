/**
 * Identifies the type of resource a collaboration lock applies to.
 */
export enum LockTargetType {
  Node = "Node",
  Edge = "Edge",
  FlowAction = "FlowAction",
}

/**
 * Represents a user currently present in a flow's collaboration session.
 */
export interface PresenceDto {
  userId: string;
  displayName?: string;
  email?: string;
  /** Optional avatar image url for the user. */
  avatarSrc?: string;
  connectionId?: string;
  flowVersionId: string;
  joinedAt: string;
}

/**
 * Represents a hard lock held by a user on a node, edge, or flow-level action.
 */
export interface LockDto {
  lockKey: string;
  flowVersionId: string;
  targetType: LockTargetType;
  targetId: string;
  holderUserId: string;
  holderDisplayName?: string;
  acquiredAt: string;
  expiresAt: string;
}

/**
 * Represents a real-time node edit broadcast to other collaborators.
 */
export interface NodeEditDto {
  flowVersionId: string;
  nodeId: string;
  node: string;
  editedByUserId: string;
  editedByDisplayName?: string;
  timestamp: string;
}

/**
 * Represents a real-time edge edit broadcast to other collaborators.
 */
export interface EdgeEditDto {
  flowVersionId: string;
  edgeId: string;
  edge: string;
  editedByUserId: string;
  editedByDisplayName?: string;
  timestamp: string;
}

/**
 * Represents a full graph snapshot (nodes + edges) broadcast for structural changes
 * such as adding or deleting a node. Structural edits re-run dagre layout which
 * repositions the whole graph, so collaborators replace their entire graph.
 */
export interface GraphEditDto {
  flowVersionId: string;
  nodes: string;
  edges: string;
  editedByUserId: string;
  editedByDisplayName?: string;
  timestamp: string;
}

/**
 * Identifies a flow-level action that can be locked.
 */
export enum FlowActionType {
  Publish = "Publish",
  Delete = "Delete",
  RestoreVersion = "RestoreVersion",
}

/**
 * Represents a lock on a flow-level action within a collaboration session.
 */
export interface FlowActionLockDto {
  flowVersionId: string;
  action: FlowActionType;
  holderUserId: string;
  holderDisplayName?: string;
}

/**
 * Represents a collaborator's live cursor position on the canvas. Coordinates are in
 * flow space (not screen space) so they remain correct under pan/zoom. Cursors are
 * ephemeral — broadcast-only with a short frontend TTL; never persisted.
 */
export interface CursorDto {
  flowVersionId: string;
  x: number;
  y: number;
  userId: string;
  displayName?: string;
  email?: string;
  connectionId?: string;
}

/**
 * Snapshot returned when joining a flow: current presence + active locks.
 */
export interface CollaborationSnapshotDto {
  presence: PresenceDto[];
  locks: LockDto[];
}

/**
 * Represents an ephemeral chat message exchanged between collaborators in a flow
 * version's collaboration session. Messages are broadcast-only and never persisted.
 * A null {@link RecipientUserId} means the message is a group message sent to every
 * user currently present in the flow; a non-null value targets a single user.
 */
export interface ChatMessageDto {
  flowVersionId: string;
  senderUserId?: string;
  senderDisplayName?: string;
  senderEmail?: string;
  /** When null, the message is a group message for everyone in the flow. */
  recipientUserId?: string;
  message: string;
  sentAt: string;
}
