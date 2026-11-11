import { useDebounce } from "@avplatform/ui/hooks";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getLandingConversations } from "../apis/conversation.apis";
import {
  HOME_CHAT_HISTORY_PAGE_SIZE,
  HOME_CHAT_HISTORY_QUERY_KEY,
} from "../constants/home-chat.constant";

/** The user's active or archived Home chats in the current space, searched by title and loaded a page at a time. */
export const useHomeChatHistory = (archived: boolean) => {
  const spaceId = useCurrentSpaceStore((state) => state.currentSpace?.id ?? null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 250);

  const query = useInfiniteQuery({
    queryKey: [...HOME_CHAT_HISTORY_QUERY_KEY, spaceId, archived, debouncedSearch],
    queryFn: async ({ pageParam }) =>
      (
        await getLandingConversations({
          search: debouncedSearch || undefined,
          archived,
          skip: pageParam,
          take: HOME_CHAT_HISTORY_PAGE_SIZE,
        })
      ).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length < HOME_CHAT_HISTORY_PAGE_SIZE
        ? undefined
        : pages.length * HOME_CHAT_HISTORY_PAGE_SIZE,
    placeholderData: keepPreviousData,
  });

  // Offset pages overlap when a chat moves to the top between page loads.
  const items = useMemo(
    () => [...new Map(query.data?.pages.flat().map((item) => [item.id, item])).values()],
    [query.data],
  );

  return {
    items,
    search,
    setSearch,
    isLoading: query.isPending,
    isError: query.isError,
    retry: () => void query.refetch(),
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
    },
  };
};
