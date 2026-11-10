import {
  type ChatDestinationOption,
  type ChatStarterGroup,
  pickReachablePrompts,
} from "@avplatform/chat";
import { useMemo } from "react";

import {
  HOME_CHAT_FIND_STARTERS,
  HOME_CHAT_STARTERS,
} from "../constants/home-chat-starters.constant";

/** Home's starters, with "Find" limited to pages the user can open and dropped when none are. */
export const useHomeChatStarters = (destinations: readonly ChatDestinationOption[]) =>
  useMemo((): readonly ChatStarterGroup[] => {
    const { label, icon, candidates } = HOME_CHAT_FIND_STARTERS;
    const prompts = pickReachablePrompts(candidates, destinations).slice(0, 4);
    if (prompts.length === 0) return HOME_CHAT_STARTERS;
    const [ask, ...rest] = HOME_CHAT_STARTERS;
    return ask ? [ask, { label, icon, prompts }, ...rest] : rest;
  }, [destinations]);
