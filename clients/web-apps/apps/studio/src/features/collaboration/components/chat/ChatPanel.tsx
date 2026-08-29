import { ScrollArea } from "@avplatform/ui/scroll";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useMemo, useRef, useState } from "react";

import { useUserSessionStore } from "@avplatform/ui/stores";

import { broadcastChatEvent } from "../../hooks/useCollaboration";
import { useCollaborationStore } from "../../stores/collaboration-store";
import { ChatComposer } from "./ChatComposer";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { ChatRecipient, ChatRecipientSelect } from "./ChatRecipientSelect";

/**
 * Renders the live chat panel: a recipient selector (group vs. individual live users),
 * the message list for the selected conversation, and a composer. Messages are
 * ephemeral and held only in the collaboration store.
 */
export const ChatPanel = () => {
  const { messages, presence, setActiveConversation } = useCollaborationStore(
    useShallow((state) => ({
      messages: state.messages,
      presence: state.presence,
      setActiveConversation: state.setActiveConversation,
    })),
  );
  const localEmail = useUserSessionStore((state) => state.userSession?.email);

  const [recipient, setRecipient] = useState<ChatRecipient>({
    key: "group",
    label: "Everyone in this flow",
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Whether there is at least one other live user in the flow to chat with.
  const hasOtherLiveUsers = presence.some((p) => p.email !== localEmail);

  // Mark the active conversation whenever it changes (opening the panel or switching
  // recipients). This clears its unread count and tells the message handler which
  // conversation is being viewed so other conversations' messages stay unread.
  useEffect(() => {
    setActiveConversation(recipient.key);
  }, [recipient.key, setActiveConversation]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, recipient.key]);

  const conversationMessages = useMemo(
    () =>
      messages.filter((m) => {
        // Group messages (recipientUserId null) appear in the group conversation.
        if (!recipient.recipientUserId) return !m.recipientUserId;
        // 1:1 conversation: messages sent to us by that user, or sent by us to them.
        return (
          (m.recipientUserId === recipient.recipientUserId && m.senderUserId === localEmail) ||
          (m.senderUserId === recipient.recipientUserId && m.recipientUserId === localEmail)
        );
      }),
    [messages, recipient.recipientUserId, localEmail],
  );

  const handleSend = (text: string, r: ChatRecipient) => {
    broadcastChatEvent({
      flowVersionId: "",
      message: text,
      recipientUserId: r.recipientUserId,
    });
  };

  return (
    // Fill the popover's full height (the responsive variant is 70vh) so the composer
    // is pinned to the very bottom with no empty space below it. The message list takes
    // the flexible middle and scrolls when it overflows.
    <div className="flex h-full min-h-0 w-[22rem] flex-col">
      <ChatRecipientSelect value={recipient.key} onChange={setRecipient} />

      {!hasOtherLiveUsers ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6">
          <p className="text-center text-xs text-muted-foreground">
            No other live user in the flow
          </p>
        </div>
      ) : (
        <>
          <ScrollArea className="min-h-0 flex-1">
            <div ref={scrollRef} className="flex flex-col gap-2.5 px-3 py-3">
              {conversationMessages.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No messages yet. Say hello to your collaborators!
                </p>
              ) : (
                conversationMessages.map((m, i) => (
                  <ChatMessageBubble key={i} message={m} isOwn={m.senderUserId === localEmail} />
                ))
              )}
            </div>
          </ScrollArea>

          <ChatComposer recipient={recipient} onSend={handleSend} />
        </>
      )}
    </div>
  );
};
