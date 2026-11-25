import { useDebounce } from "@avplatform/ui/hooks";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { useHiddenDeleteIds } from "@/hooks/useDeferredDelete";
import { useCurrentSpaceStore } from "@/stores/current-space-store";
import { omitHidden } from "@/utils/deferred-delete-queue.util";

import { getLandingConversations } from "../apis/conversation.apis";
import {
  HOME_CHAT_HISTORY_PAGE_SIZE,
  HOME_CHAT_HISTORY_QUERY_KEY,
} from "../constants/home-chat.constant";

/** The user's active or archived Home chats in the current space, searched by title, optionally within one project, and loaded a page at a time; chats being deleted are left out. */
export const useHomeChatHistory = (archived: boolean, projectId: string | null = null) => {
  const spaceId = useCurrentSpaceStore((state) => state.currentSpace?.id ?? null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 250);

  const query = useInfiniteQuery({
    queryKey: [...HOME_CHAT_HISTORY_QUERY_KEY, spaceId, archived, projectId, debouncedSearch],
    queryFn: async ({ pageParam }) =>
      (
        await getLandingConversations({
          search: debouncedSearch || undefined,
          archived,
          projectId: projectId ?? undefined,
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
  const hiddenIds = useHiddenDeleteIds();
  const items = useMemo(
    () =>
      omitHidden(
        [...new Map(query.data?.pages.flat().map((item) => [item.id, item])).values()],
        hiddenIds,
      ),
    [query.data, hiddenIds],
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
