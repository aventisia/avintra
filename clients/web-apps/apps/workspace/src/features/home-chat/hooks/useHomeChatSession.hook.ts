import { useCallback, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  HOME_CHAT_CONVERSATION_ROUTE,
  HOME_CHAT_TEMPORARY_PARAM,
} from "../constants/home-chat.constant";

type HomeChatSession = {
  key: number;
  conversationId?: string;
  locationKey: string;
};

/**
 * Decides which thread Home shows. Every navigation starts a fresh thread,
 * except the URL update that follows this thread creating its conversation.
 * A new chat opened with `?temporary=1` is temporary: it is never saved.
 */
export const useHomeChatSession = () => {
  const { conversationId: routeConversationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTemporary = !routeConversationId && searchParams.get(HOME_CHAT_TEMPORARY_PARAM) === "1";
  const [session, setSession] = useState<HomeChatSession>({
    key: 0,
    conversationId: routeConversationId,
    locationKey: location.key,
  });

  if (session.locationKey !== location.key) {
    const isSameThread = !!routeConversationId && routeConversationId === session.conversationId;
    setSession({
      key: isSameThread ? session.key : session.key + 1,
      conversationId: routeConversationId,
      locationKey: location.key,
    });
  }

  const onConversationCreated = useCallback(
    (conversationId: string) => {
      setSession((current) => ({ ...current, conversationId }));
      navigate(`${HOME_CHAT_CONVERSATION_ROUTE}/${conversationId}`, { replace: true });
    },
    [navigate],
  );

  const onConversationMissing = useCallback(() => navigate("/", { replace: true }), [navigate]);

  return {
    sessionKey: session.key,
    conversationId: session.conversationId,
    isTemporary,
    onConversationCreated,
    onConversationMissing,
  };
};
