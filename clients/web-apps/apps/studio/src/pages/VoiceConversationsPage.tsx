import { ReactFlowProvider } from "@xyflow/react";

import { VoiceConversations } from "@/features/voice-conversations";

/** Voice agent conversations; the provider lets the shared flow loader fill the header. */
export const VoiceConversationsPage = () => (
  <ReactFlowProvider>
    <VoiceConversations />
  </ReactFlowProvider>
);
