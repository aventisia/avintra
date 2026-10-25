import { create } from "zustand";

import {
  ChatMessageDto,
  CursorDto,
  FlowActionLockDto,
  LockDto,
  PresenceDto,
} from "../dtos/collaboration-dtos";

type State = {
  /** Users currently present in the flow. */
  presence: PresenceDto[];

  /** Active locks keyed by lockKey. */
  locks: Record<string, LockDto>;

  /** Flow-level action locks keyed by `${flowVersionId}:${action}`. */
  flowActionLocks: Record<string, FlowActionLockDto>;

  /** Live remote cursors keyed by connectionId (a user may have multiple tabs). */
  cursors: Record<string, CursorDto>;

  /** Whether the SignalR connection is established. */
  isConnected: boolean;

  /** Ephemeral chat messages received in this session (never persisted). */
  messages: ChatMessageDto[];

  /** Number of unread chat messages across all conversations. */
  unreadCount: number;

  /** Unread count per conversation, keyed by the recipient key used in the dropdown
   *  ("group" for the group chat, or the sender's user id for 1:1 chats). */
  unreadByConversation: Record<string, number>;

  /** The conversation currently being viewed in the chat panel (dropdown key). */
  activeConversationKey: string;

  /** Whether the chat popover is currently open. */
  isChatOpen: boolean;
};

type Actions = {
  setConnected: (isConnected: boolean) => void;
  setPresence: (presence: PresenceDto[]) => void;
  upsertLock: (lock: LockDto) => void;
  removeLock: (lockKey: string) => void;
  setFlowActionLock: (lock: FlowActionLockDto) => void;
  clearFlowActionLock: (flowVersionId: string, action: string) => void;
  upsertCursor: (cursor: CursorDto) => void;
  removeCursor: (connectionId: string) => void;
  setCursors: (cursors: Record<string, CursorDto>) => void;
  addMessage: (message: ChatMessageDto) => void;
  clearMessages: () => void;
  incrementUnread: (conversationKey: string) => void;
  resetUnread: () => void;
  resetUnreadForConversation: (conversationKey: string) => void;
  setActiveConversation: (conversationKey: string) => void;
  setChatOpen: (isOpen: boolean) => void;
  reset: () => void;
};

const initialState: State = {
  presence: [],
  locks: {},
  flowActionLocks: {},
  cursors: {},
  isConnected: false,
  messages: [],
  unreadCount: 0,
  unreadByConversation: {},
  activeConversationKey: "group",
  isChatOpen: false,
};

export const useCollaborationStore = create<State & Actions>((set) => ({
  ...initialState,

  setConnected: (isConnected) => set({ isConnected }),

  setPresence: (presence) => set({ presence }),

  upsertLock: (lock) =>
    set((state) => ({
      locks: { ...state.locks, [lock.lockKey]: lock },
    })),

  removeLock: (lockKey) =>
    set((state) => {
      const locks = { ...state.locks };
      delete locks[lockKey];
      return { locks };
    }),

  setFlowActionLock: (lock) =>
    set((state) => ({
      flowActionLocks: {
        ...state.flowActionLocks,
        [`${lock.flowVersionId}:${lock.action}`]: lock,
      },
    })),

  clearFlowActionLock: (flowVersionId, action) =>
    set((state) => {
      const flowActionLocks = { ...state.flowActionLocks };
      delete flowActionLocks[`${flowVersionId}:${action}`];
      return { flowActionLocks };
    }),

  upsertCursor: (cursor) =>
    set((state) => {
      const key = cursor.connectionId ?? cursor.userId;
      if (!key) return state;
      return { cursors: { ...state.cursors, [key]: cursor } };
    }),

  removeCursor: (connectionId) =>
    set((state) => {
      const cursors = { ...state.cursors };
      delete cursors[connectionId];
      return { cursors };
    }),

  setCursors: (cursors) => set({ cursors }),

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  clearMessages: () => set({ messages: [] }),

  incrementUnread: (conversationKey) =>
    set((state) => ({
      unreadCount: state.unreadCount + 1,
      unreadByConversation: {
        ...state.unreadByConversation,
        [conversationKey]: (state.unreadByConversation[conversationKey] ?? 0) + 1,
      },
    })),

  resetUnread: () => set({ unreadCount: 0, unreadByConversation: {} }),

  resetUnreadForConversation: (conversationKey) =>
    set((state) => {
      const unreadByConversation = { ...state.unreadByConversation };
      const cleared = unreadByConversation[conversationKey] ?? 0;
      delete unreadByConversation[conversationKey];
      return {
        unreadByConversation,
        unreadCount: Math.max(0, state.unreadCount - cleared),
      };
    }),

  setActiveConversation: (conversationKey) =>
    set((state) => {
      // Switching to a conversation clears its unread count.
      const unreadByConversation = { ...state.unreadByConversation };
      const cleared = unreadByConversation[conversationKey] ?? 0;
      delete unreadByConversation[conversationKey];
      return {
        activeConversationKey: conversationKey,
        unreadByConversation,
        unreadCount: Math.max(0, state.unreadCount - cleared),
      };
    }),

  setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),

  reset: () => set({ ...initialState }),
}));
