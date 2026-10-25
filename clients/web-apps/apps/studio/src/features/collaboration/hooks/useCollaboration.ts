import { useUserSessionStore } from "@avplatform/ui/stores";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import {
  ChatMessageDto,
  CollaborationSnapshotDto,
  CursorDto,
  EdgeEditDto,
  FlowActionLockDto,
  FlowActionType,
  GraphEditDto,
  LockDto,
  LockTargetType,
  NodeEditDto,
  PresenceDto,
} from "../dtos/collaboration-dtos";
import { useCollaborationStore } from "../stores/collaboration-store";

// Module-level broadcast of flow actions so components outside the canvas (e.g. the
// Publish button) can notify collaborators without calling the hook directly.
let flowActionBroadcastFn: ((action: FlowActionType) => void) | null = null;
let flowActionReleaseBroadcastFn: ((action: FlowActionType) => void) | null = null;

// Tracks whether the local user has an active publish dialog. The Publish button lives
// inside a dropdown that unmounts when closed, so this flag persists the "publishing in
// progress" state so a persistent watcher can broadcast the release when the dialog closes.
let isPublishDialogActive = false;

export const setFlowActionBroadcaster = (fn: ((action: FlowActionType) => void) | null) => {
  flowActionBroadcastFn = fn;
};

export const setFlowActionReleaseBroadcaster = (fn: ((action: FlowActionType) => void) | null) => {
  flowActionReleaseBroadcastFn = fn;
};

/** Broadcasts a flow-level action lock to other collaborators. */
export const broadcastFlowActionEvent = (action: FlowActionType) => {
  if (action === FlowActionType.Publish) isPublishDialogActive = true;
  flowActionBroadcastFn?.(action);
};

/** Broadcasts a flow-level action lock release to other collaborators. */
export const broadcastFlowActionReleaseEvent = (action: FlowActionType) => {
  if (action === FlowActionType.Publish) isPublishDialogActive = false;
  flowActionReleaseBroadcastFn?.(action);
};

/**
 * Broadcasts the release of the publish action if the local user had a publish dialog
 * open. Called by a persistent watcher when the alert dialog closes, since the Publish
 * button component itself is unmounted by the time the dialog closes.
 */
export const releasePublishActionIfActive = () => {
  if (isPublishDialogActive) {
    isPublishDialogActive = false;
    flowActionReleaseBroadcastFn?.(FlowActionType.Publish);
  }
};

// ─── Cursor broadcast plumbing ─────────────────────────────────────────────
// Cursor positions are emitted by the canvas on mousemove and forwarded to the hub
// through a module-level broadcaster (registered by the useCollaboration hook). This
// avoids a circular import between the canvas component and the collaboration feature.
let cursorBroadcastFn: ((x: number, y: number) => void) | null = null;

export const setCursorBroadcaster = (fn: ((x: number, y: number) => void) | null) => {
  cursorBroadcastFn = fn;
};

// Throttle cursor broadcasts so mousemove doesn't flood the hub / trigger the rate limiter.
let cursorBroadcastTimer: ReturnType<typeof setTimeout> | null = null;
let pendingCursor: { x: number; y: number } | null = null;

/**
 * Broadcasts the local cursor position (in flow coordinates) to other collaborators,
 * throttled to ~50ms. Called from the canvas onPaneMouseMove.
 */
export const broadcastCursorEvent = (x: number, y: number) => {
  pendingCursor = { x, y };
  if (cursorBroadcastTimer) return;
  cursorBroadcastTimer = setTimeout(() => {
    cursorBroadcastTimer = null;
    if (cursorBroadcastFn && pendingCursor) {
      cursorBroadcastFn(pendingCursor.x, pendingCursor.y);
    }
    pendingCursor = null;
  }, 50);
};

// Per-cursor TTL so remote cursors disappear shortly after the user stops moving
// (there's no explicit "cursor left" signal on pointer idle in v1).
const CURSOR_TTL_MS = 3000;
const cursorExpiryTimers: Record<string, ReturnType<typeof setTimeout>> = {};

const scheduleCursorExpiry = (key: string) => {
  if (cursorExpiryTimers[key]) clearTimeout(cursorExpiryTimers[key]);
  cursorExpiryTimers[key] = setTimeout(() => {
    delete cursorExpiryTimers[key];
    useCollaborationStore.getState().removeCursor(key);
  }, CURSOR_TTL_MS);
};

// ─── Chat broadcast plumbing ───────────────────────────────────────────────
// Chat messages are sent from the chat panel (which lives in the header, outside the
// canvas) through a module-level broadcaster registered by the useCollaboration hook.
// This mirrors the cursor/flow-action pattern and avoids a circular import.
let chatBroadcastFn: ((message: ChatMessageDto) => void) | null = null;

export const setChatBroadcaster = (fn: ((message: ChatMessageDto) => void) | null) => {
  chatBroadcastFn = fn;
};

/**
 * Sends an ephemeral chat message to collaborators in the current flow. Called from
 * the chat panel; forwarded to the hub through the registered broadcaster.
 */
export const broadcastChatEvent = (message: ChatMessageDto) => {
  chatBroadcastFn?.(message);
};

/**
 * Establishes the SignalR connection to the agent builder collaboration hub,
 * joins the current flow version's group, and wires presence + lock + edit events
 * into the collaboration store. Exposes actions to acquire/release locks and
 * broadcast node/edge edits.
 */
export const useCollaboration = () => {
  const connectionRef = useRef<HubConnection | null>(null);
  const flowVersionIdRef = useRef<string>("");

  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({ currentFlow: state.currentFlow })),
  );

  const userSession = useUserSessionStore((state) => state.userSession);

  const setConnected = useCollaborationStore((state) => state.setConnected);
  const setPresence = useCollaborationStore((state) => state.setPresence);
  const upsertLock = useCollaborationStore((state) => state.upsertLock);
  const removeLock = useCollaborationStore((state) => state.removeLock);
  const setFlowActionLock = useCollaborationStore((state) => state.setFlowActionLock);
  const clearFlowActionLock = useCollaborationStore((state) => state.clearFlowActionLock);
  const upsertCursor = useCollaborationStore((state) => state.upsertCursor);
  const addMessage = useCollaborationStore((state) => state.addMessage);
  const incrementUnread = useCollaborationStore((state) => state.incrementUnread);
  const reset = useCollaborationStore((state) => state.reset);

  const flowVersionId = currentFlow.versionId;

  // Keep the latest flow version id in a ref for use inside event handlers.
  useEffect(() => {
    flowVersionIdRef.current = flowVersionId;
  }, [flowVersionId]);

  // Establish the connection once and join/leave the flow group as it changes.
  useEffect(() => {
    let isMounted = true;
    let connection: HubConnection | null = null;

    const hubUrl = `${import.meta.env.VITE_WORKSPACE_API_PATH}/agentbuilder/hub`;

    connection = new HubConnectionBuilder()
      .withUrl(hubUrl, { withCredentials: true })
      .withAutomaticReconnect({ nextRetryDelayInMilliseconds: () => 5000 })
      .configureLogging(LogLevel.Information)
      .build();

    connectionRef.current = connection;

    connection.on("PresenceChanged", (presence: PresenceDto[]) => {
      if (isMounted) setPresence(presence);
    });

    connection.on("CollaborationSnapshot", (snapshot: CollaborationSnapshotDto) => {
      if (!isMounted) return;
      setPresence(snapshot.presence ?? []);
      (snapshot.locks ?? []).forEach((lock) => upsertLock(lock));
    });

    connection.on("LockAcquired", (lock: LockDto) => {
      if (isMounted) upsertLock(lock);
    });

    connection.on("LockReleased", (payload: { lockKey: string }) => {
      if (isMounted && payload?.lockKey) removeLock(payload.lockKey);
    });

    connection.on("FlowActionLocked", (lock: FlowActionLockDto) => {
      if (isMounted) setFlowActionLock(lock);
    });

    connection.on("FlowActionLockReleased", (lock: FlowActionLockDto) => {
      if (isMounted && lock?.flowVersionId && lock?.action) {
        clearFlowActionLock(lock.flowVersionId, lock.action);
      }
    });

    connection.on("NodeChanged", (edit: NodeEditDto) => {
      if (isMounted) applyRemoteNode(edit);
    });

    connection.on("EdgeChanged", (edit: EdgeEditDto) => {
      if (isMounted) applyRemoteEdge(edit);
    });

    connection.on("GraphChanged", (edit: GraphEditDto) => {
      if (isMounted) applyRemoteGraph(edit);
    });

    connection.on("CursorChanged", (cursor: CursorDto) => {
      if (!isMounted || !cursor) return;
      const key = cursor.connectionId ?? cursor.userId;
      if (!key) return;
      // Drop stale cursor timestamps are not sent; instead we keep a per-cursor TTL
      // timer below so cursors fade out shortly after the user stops moving.
      upsertCursor(cursor);
      scheduleCursorExpiry(key);
    });

    connection.on("ChatMessageReceived", (message: ChatMessageDto) => {
      if (!isMounted || !message) return;
      // Ignore messages we sent ourselves (the hub broadcasts to OthersInGroup, but
      // guard defensively in case of reconnect/echo). Read the local email from the
      // store directly to avoid a stale closure (the effect runs once).
      const localEmail = useUserSessionStore.getState().userSession?.email;
      if (message.senderUserId === localEmail) return;
      addMessage(message);
      // Count as unread UNLESS the panel is open AND this is the conversation being
      // viewed. When the panel is closed, always count as unread (even for the last
      // viewed conversation) so the user gets an alert. The conversation key is the
      // sender's email for 1:1 messages (matching the dropdown key) or "group" for
      // group messages. Read from the store directly to avoid a stale closure.
      const store = useCollaborationStore.getState();
      const conversationKey = message.recipientUserId ? (message.senderUserId ?? "group") : "group";
      const isViewing = store.isChatOpen && conversationKey === store.activeConversationKey;
      if (!isViewing) {
        incrementUnread(conversationKey);
      }
    });

    connection.onreconnecting(() => {
      if (isMounted) setConnected(false);
    });

    connection.onreconnected(() => {
      if (isMounted) {
        setConnected(true);
        // Re-join the flow group after a reconnect to restore presence + locks.
        if (flowVersionIdRef.current) {
          connection?.invoke("JoinFlow", flowVersionIdRef.current).catch(() => undefined);
        }
      }
    });

    connection.onclose(() => {
      if (isMounted) setConnected(false);
    });

    const startConnection = async () => {
      try {
        await connection?.start();
        if (isMounted) {
          setConnected(true);
          if (flowVersionIdRef.current) {
            await connection?.invoke("JoinFlow", flowVersionIdRef.current).catch(() => undefined);
          }
        }
      } catch {
        if (isMounted) setConnected(false);
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      if (flowVersionIdRef.current) {
        connection?.invoke("LeaveFlow", flowVersionIdRef.current).catch(() => undefined);
      }
      connection?.stop();
      connectionRef.current = null;
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Join/leave the flow group when the flow version changes.
  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection || !flowVersionId) return;

    connection.invoke("JoinFlow", flowVersionId).catch(() => undefined);
  }, [flowVersionId]);

  const displayName = userSession
    ? `${userSession.firstName} ${userSession.lastName}`.trim() || userSession.email
    : undefined;

  const acquireLock = useCallback(
    async (targetType: LockTargetType, targetId: string) => {
      const connection = connectionRef.current;
      if (!connection || !flowVersionIdRef.current) return null;

      const lockKey = `${flowVersionIdRef.current}:${targetType}:${targetId}`;

      // Skip if a lock already exists for this key (the store already reflects it,
      // whether held by us or another user). Prevents redundant hub calls + store churn.
      const existing = useCollaborationStore.getState().locks[lockKey];
      if (existing) {
        return existing;
      }

      const lock: LockDto = {
        lockKey,
        flowVersionId: flowVersionIdRef.current,
        targetType,
        targetId,
        holderUserId: userSession?.email ?? "",
        holderDisplayName: displayName,
        acquiredAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      };

      try {
        const result = await connection.invoke<LockDto | null>("AcquireLock", lock);
        if (result) upsertLock(result);
        return result;
      } catch {
        return null;
      }
    },
    [userSession?.email, displayName, upsertLock],
  );

  const refreshLock = useCallback(async (lockKey: string) => {
    const connection = connectionRef.current;
    if (!connection) return;
    try {
      await connection.invoke("RefreshLock", lockKey);
    } catch {
      // ignore
    }
  }, []);

  const releaseLock = useCallback(async (lockKey: string) => {
    const connection = connectionRef.current;
    if (!connection || !flowVersionIdRef.current) return;
    try {
      await connection.invoke("ReleaseLock", lockKey, flowVersionIdRef.current);
    } catch {
      // ignore
    }
  }, []);

  const forceReleaseLock = useCallback(async (lockKey: string) => {
    const connection = connectionRef.current;
    if (!connection || !flowVersionIdRef.current) return;
    try {
      await connection.invoke("ForceReleaseLock", lockKey, flowVersionIdRef.current);
    } catch {
      // ignore
    }
  }, []);

  const broadcastNodeChange = useCallback(
    async (nodeId: string, node: string) => {
      const connection = connectionRef.current;
      if (!connection || !flowVersionIdRef.current) return;
      const edit: NodeEditDto = {
        flowVersionId: flowVersionIdRef.current,
        nodeId,
        node,
        editedByUserId: userSession?.email ?? "",
        editedByDisplayName: displayName,
        timestamp: new Date().toISOString(),
      };
      try {
        await connection.invoke("BroadcastNodeChange", edit);
      } catch {
        // ignore
      }
    },
    [userSession?.email, displayName],
  );

  const broadcastEdgeChange = useCallback(
    async (edgeId: string, edge: string) => {
      const connection = connectionRef.current;
      if (!connection || !flowVersionIdRef.current) return;
      const edit: EdgeEditDto = {
        flowVersionId: flowVersionIdRef.current,
        edgeId,
        edge,
        editedByUserId: userSession?.email ?? "",
        editedByDisplayName: displayName,
        timestamp: new Date().toISOString(),
      };
      try {
        await connection.invoke("BroadcastEdgeChange", edit);
      } catch {
        // ignore
      }
    },
    [userSession?.email, displayName],
  );

  const broadcastGraphChange = useCallback(
    async (nodes: string, edges: string) => {
      const connection = connectionRef.current;
      if (!connection || !flowVersionIdRef.current) return;
      const edit: GraphEditDto = {
        flowVersionId: flowVersionIdRef.current,
        nodes,
        edges,
        editedByUserId: userSession?.email ?? "",
        editedByDisplayName: displayName,
        timestamp: new Date().toISOString(),
      };
      try {
        await connection.invoke("BroadcastGraphChange", edit);
      } catch {
        // ignore
      }
    },
    [userSession?.email, displayName],
  );

  const broadcastFlowAction = useCallback(
    async (action: FlowActionType) => {
      const connection = connectionRef.current;
      if (!connection || !flowVersionIdRef.current) return;
      const lock: FlowActionLockDto = {
        flowVersionId: flowVersionIdRef.current,
        action,
        holderUserId: userSession?.email ?? "",
        holderDisplayName: displayName,
      };
      try {
        await connection.invoke("BroadcastFlowAction", lock);
      } catch {
        // ignore
      }
    },
    [userSession?.email, displayName],
  );

  const broadcastFlowActionRelease = useCallback(
    async (action: FlowActionType) => {
      const connection = connectionRef.current;
      if (!connection || !flowVersionIdRef.current) return;
      const lock: FlowActionLockDto = {
        flowVersionId: flowVersionIdRef.current,
        action,
        holderUserId: userSession?.email ?? "",
        holderDisplayName: displayName,
      };
      try {
        await connection.invoke("BroadcastFlowActionRelease", lock);
      } catch {
        // ignore
      }
    },
    [userSession?.email, displayName],
  );

  const broadcastCursor = useCallback(
    async (x: number, y: number) => {
      const connection = connectionRef.current;
      if (!connection || !flowVersionIdRef.current) return;
      const cursor: CursorDto = {
        flowVersionId: flowVersionIdRef.current,
        x,
        y,
        userId: userSession?.email ?? "",
        displayName,
        email: userSession?.email,
      };
      try {
        await connection.invoke("BroadcastCursor", cursor);
      } catch {
        // ignore
      }
    },
    [userSession?.email, displayName],
  );

  const broadcastChatMessage = useCallback(
    async (message: ChatMessageDto) => {
      const connection = connectionRef.current;
      if (!connection || !flowVersionIdRef.current) return;
      const chat: ChatMessageDto = {
        flowVersionId: flowVersionIdRef.current,
        senderUserId: userSession?.email ?? "",
        senderDisplayName: displayName,
        senderEmail: userSession?.email,
        recipientUserId: message.recipientUserId,
        message: message.message,
        sentAt: new Date().toISOString(),
      };
      // Optimistically add the message locally so the sender sees it immediately.
      // The hub broadcasts to OthersInGroup, so the sender's own message is never
      // echoed back to them.
      addMessage(chat);
      try {
        await connection.invoke("SendChatMessage", chat);
      } catch {
        // ignore
      }
    },
    [userSession?.email, displayName, addMessage],
  );

  // Register this hook's broadcasters as the module-level broadcasters so the
  // Publish button (which lives outside this canvas component) can notify collaborators,
  // the canvas can broadcast cursor positions, and the chat panel can send messages.
  useEffect(() => {
    setFlowActionBroadcaster(broadcastFlowAction);
    setFlowActionReleaseBroadcaster(broadcastFlowActionRelease);
    setCursorBroadcaster(broadcastCursor);
    setChatBroadcaster(broadcastChatMessage);
    return () => {
      setFlowActionBroadcaster(null);
      setFlowActionReleaseBroadcaster(null);
      setCursorBroadcaster(null);
      setChatBroadcaster(null);
    };
  }, [broadcastFlowAction, broadcastFlowActionRelease, broadcastCursor, broadcastChatMessage]);

  return {
    acquireLock,
    refreshLock,
    releaseLock,
    forceReleaseLock,
    broadcastNodeChange,
    broadcastEdgeChange,
    broadcastGraphChange,
    broadcastFlowAction,
    broadcastCursor,
    broadcastChatMessage,
    clearFlowActionLock,
  };
};

/**
 * Applies a remote node edit to the local store by replacing the node with the
 * same id. Uses the `isApplyingRemote` guard so the change is not re-broadcast
 * and does not pollute undo/redo history.
 */
const applyRemoteNode = (edit: NodeEditDto) => {
  const store = useReactFlowExtStore.getState();
  if (store.isApplyingRemote) return;

  let node: unknown;
  try {
    node = JSON.parse(edit.node);
  } catch {
    return;
  }
  if (!node || typeof node !== "object" || !("id" in node)) return;

  const nodeId = (node as { id: string }).id;
  const exists = store.nodes.some((n) => n.id === nodeId);

  useReactFlowExtStore.setState({ isApplyingRemote: true });
  try {
    // Insert the node if it's new (added by another collaborator), otherwise replace it.
    const nextNodes = exists
      ? store.nodes.map((n) => (n.id === nodeId ? (node as never) : n))
      : [...store.nodes, node as never];
    useReactFlowExtStore.setState({ nodes: nextNodes });
  } finally {
    useReactFlowExtStore.setState({ isApplyingRemote: false });
  }
};

/**
 * Applies a remote edge edit to the local store (add or remove by id).
 */
const applyRemoteEdge = (edit: EdgeEditDto) => {
  const store = useReactFlowExtStore.getState();
  if (store.isApplyingRemote) return;

  let edge: unknown;
  try {
    edge = JSON.parse(edit.edge);
  } catch {
    return;
  }
  if (!edge || typeof edge !== "object" || !("id" in edge)) return;

  const edgeId = (edge as { id: string }).id;
  const removed = (edge as { removed?: boolean }).removed === true;

  useReactFlowExtStore.setState({ isApplyingRemote: true });
  try {
    if (removed) {
      const nextEdges = store.edges.filter((e) => e.id !== edgeId);
      useReactFlowExtStore.setState({ edges: nextEdges });
    } else {
      const exists = store.edges.some((e) => e.id === edgeId);
      const nextEdges = exists
        ? store.edges.map((e) => (e.id === edgeId ? (edge as never) : e))
        : [...store.edges, edge as never];
      useReactFlowExtStore.setState({ edges: nextEdges });
    }
  } finally {
    useReactFlowExtStore.setState({ isApplyingRemote: false });
  }
};

/**
 * Applies a remote full-graph snapshot (nodes + edges) for structural changes such as
 * node/edge add or delete. Replaces the entire graph so positions stay in sync with the
 * sender (dagre layout repositions the whole graph on structural edits). Treated as a
 * committed snapshot so isSavePending reflects it and undo/redo history isn't polluted.
 */
const applyRemoteGraph = (edit: GraphEditDto) => {
  const store = useReactFlowExtStore.getState();
  if (store.isApplyingRemote) return;

  let nodes: unknown;
  let edges: unknown;
  try {
    nodes = JSON.parse(edit.nodes);
    edges = JSON.parse(edit.edges);
  } catch {
    return;
  }
  if (!Array.isArray(nodes) || !Array.isArray(edges)) return;

  useReactFlowExtStore.setState({ isApplyingRemote: true });
  try {
    useReactFlowExtStore.setState({
      nodes: nodes as never[],
      edges: edges as never[],
      savedSnapshot: {
        nodes: nodes as never[],
        edges: edges as never[],
        flowVariablesObject: store.flowVariablesObject,
      },
      isSavePending: false,
    });
  } finally {
    useReactFlowExtStore.setState({ isApplyingRemote: false });
  }
};
