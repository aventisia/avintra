import { createContext } from "react";

import type { ChatFile } from "../utils/chat-file.util";

/** Where a reply's file is: stored (with its id), being saved, or not stored. */
export type ChatFileState = { id: string } | "saving" | null;

/** How the thread looks up and opens the files replies produce. */
export type ChatFileHandlers = {
  /** Called on each render of a reply's file, so keep it cheap. */
  resolveFile: (file: ChatFile) => ChatFileState;
  onOpenFile: (id: string) => void;
};

/** The thread's file handlers; null leaves files inline as code. */
export const ChatFileContext = createContext<ChatFileHandlers | null>(null);
