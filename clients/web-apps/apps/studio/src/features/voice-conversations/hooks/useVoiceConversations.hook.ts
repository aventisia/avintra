import { useQuery } from "@tanstack/react-query";

import { getActiveConversations, getMessages } from "../apis/voice-conversations.apis";
import { ConversationChannelEnum } from "../enums/conversation-channel.enum";
import {
  toVoiceConversationSummary,
  toVoiceConversationTurns,
} from "../utils/voice-conversation.util";

const VOICE_CONVERSATIONS_QUERY_KEY = "voice-conversations";

export const useVoiceConversations = (flowVersionId: string | undefined) =>
  useQuery({
    queryKey: [VOICE_CONVERSATIONS_QUERY_KEY, flowVersionId],
    queryFn: () => getActiveConversations(flowVersionId as string),
    enabled: Boolean(flowVersionId),
    select: (response) =>
      response.data
        .filter((conversation) => conversation.channel === ConversationChannelEnum.Voice)
        .map(toVoiceConversationSummary),
  });

export const useVoiceConversationTurns = (conversationId: string | undefined) =>
  useQuery({
    queryKey: [VOICE_CONVERSATIONS_QUERY_KEY, conversationId, "messages"],
    queryFn: () => getMessages(conversationId as string),
    enabled: Boolean(conversationId),
    select: (response) => toVoiceConversationTurns(response.data),
  });
