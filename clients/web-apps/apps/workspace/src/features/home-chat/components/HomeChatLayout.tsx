import { useHomeChatSession } from "../hooks/useHomeChatSession.hook";
import { HomeChatThread } from "./HomeChatThread";

/** Lays out Home, the chat-first landing page. */
export const HomeChatLayout = () => {
  const { sessionKey, ...session } = useHomeChatSession();
  return (
    <div className="flex h-full min-h-0 flex-col">
      <h1 className="sr-only">Home</h1>
      <HomeChatThread key={sessionKey} {...session} />
    </div>
  );
};
