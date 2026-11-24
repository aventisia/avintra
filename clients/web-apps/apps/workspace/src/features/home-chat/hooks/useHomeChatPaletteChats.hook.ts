import { useDebounce } from "@avplatform/ui/hooks";
import { ChatCircleIcon } from "@phosphor-icons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getLandingConversations } from "../apis/conversation.apis";
import {
  HOME_CHAT_CONVERSATION_ROUTE,
  HOME_CHAT_HISTORY_QUERY_KEY,
} from "../constants/home-chat.constant";
import { useIsHomeChatAvailable } from "./useIsHomeChatAvailable.hook";

const PALETTE_CHAT_COUNT = 6;

/** Home chats for the ⌘K palette: the most recent ones, or those whose title or messages contain the search. */
export const useHomeChatPaletteChats = (isOpen: boolean, search: string) => {
  const isHomeChatAvailable = useIsHomeChatAvailable();
  const spaceId = useCurrentSpaceStore((state) => state.currentSpace?.id ?? null);
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(search.trim(), 250);

  const { data } = useQuery({
    queryKey: [...HOME_CHAT_HISTORY_QUERY_KEY, "palette", spaceId, debouncedSearch],
    queryFn: async () =>
      (
        await getLandingConversations({
          search: debouncedSearch || undefined,
          archived: false,
          skip: 0,
          take: PALETTE_CHAT_COUNT,
        })
      ).data,
    enabled: isOpen && isHomeChatAvailable,
    placeholderData: keepPreviousData,
  });

  if (!isOpen || !data?.length) return [];
  return [
    {
      heading: debouncedSearch ? "Chats" : "Recent chats",
      items: data.map((chat) => ({
        id: chat.id,
        label: chat.title,
        hint: "Chat",
        Icon: ChatCircleIcon,
        onSelect: () => navigate(`${HOME_CHAT_CONVERSATION_ROUTE}/${chat.id}`),
      })),
    },
  ];
};
