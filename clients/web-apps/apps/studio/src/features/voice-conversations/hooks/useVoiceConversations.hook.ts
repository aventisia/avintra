import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getMessages } from "../apis/voice-conversations.apis";
import { toVoiceCallActivity } from "../utils/voice-call-activity.util";
import {
  toVoiceConversationSummary,
  toVoiceConversationTurns,
} from "../utils/voice-conversation.util";
import {
  VOICE_CONVERSATIONS_QUERY_KEY,
  isVoiceConversation,
  voiceConversationsQueryOptions,
} from "../utils/voice-conversations-query.util";

export const useVoiceConversations = (flowVersionId: string | undefined) =>
  useQuery({
    ...voiceConversationsQueryOptions(flowVersionId as string),
    enabled: Boolean(flowVersionId),
    select: (response) => response.data.filter(isVoiceConversation).map(toVoiceConversationSummary),
  });

export const useVoiceConversationTurns = (conversationId: string | undefined) =>
  useQuery({
    queryKey: [VOICE_CONVERSATIONS_QUERY_KEY, conversationId, "messages"],
    queryFn: () => getMessages(conversationId as string),
    enabled: Boolean(conversationId),
    select: (response) => toVoiceConversationTurns(response.data),
  });

/** Call activity of one version over the last `dayCount` days, shaped like agent run activity. */
export const useVoiceCallActivity = (flowVersionId: string | undefined, dayCount: number) => {
  const { data, isLoading, isError } = useVoiceConversations(flowVersionId);
  const activity = useMemo(
    () => (data ? toVoiceCallActivity(data, dayCount) : undefined),
    [data, dayCount],
  );
  return { activity, isLoading, isError };
};
