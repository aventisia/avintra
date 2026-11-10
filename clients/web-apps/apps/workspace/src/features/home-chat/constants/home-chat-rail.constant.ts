import { createContext } from "react";

/** Lets the open file preview hide the history rail until it closes, so the thread keeps its width. */
export const HomeChatRailYieldContext = createContext<(isYielding: boolean) => void>(() => {});
