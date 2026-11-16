import { createContext } from "react";

import type { ChatDestinationOption } from "../utils/chat-intent.util";

/** The pages the thread may offer and how to open one. */
export const ChatIntentContext = createContext<{
  destinations: readonly ChatDestinationOption[];
  onNavigate?: (route: string) => void;
}>({ destinations: [] });
