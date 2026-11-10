import {
  FileCodeIcon,
  FileCsvIcon,
  FileImageIcon,
  FileMdIcon,
  FileTextIcon,
  type Icon,
} from "@phosphor-icons/react";
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

/** The icon for each type a reply can store as a file, shared by chat cards and the Artifacts page. */
export const CHAT_FILE_ICONS: Record<string, Icon> = {
  "text/html": FileCodeIcon,
  "image/svg+xml": FileImageIcon,
  "text/csv": FileCsvIcon,
  "text/tab-separated-values": FileTextIcon,
  "text/markdown": FileMdIcon,
};
