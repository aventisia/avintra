import { QueryClient, queryOptions } from "@tanstack/react-query";

import { getActiveConversations } from "../apis/voice-conversations.apis";
import type { ConversationDto } from "../dtos/conversation.dto";
import { ConversationChannelEnum } from "../enums/conversation-channel.enum";

export const VOICE_CONVERSATIONS_QUERY_KEY = "voice-conversations";

export const voiceConversationsQueryOptions = (flowVersionId: string) =>
  queryOptions({
    queryKey: [VOICE_CONVERSATIONS_QUERY_KEY, flowVersionId],
    queryFn: () => getActiveConversations(flowVersionId),
  });

export const isVoiceConversation = (conversation: ConversationDto) =>
  conversation.channel === ConversationChannelEnum.Voice;

/** Fetches the voice calls for the version in the URL and counts them; `null` when the URL names no version. */
export const countVoiceConversations = async (
  queryClient: QueryClient,
  searchParams: URLSearchParams,
): Promise<number | null> => {
  const versionId = searchParams.get("v") || "";
  if (!versionId) return null;

  const response = await queryClient.fetchQuery(voiceConversationsQueryOptions(versionId));
  return response.data?.filter(isVoiceConversation).length ?? 0;
};
