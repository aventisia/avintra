import { Button } from "@aventisia/ui/buttons";
import { useParams } from "react-router-dom";

import { useUnArchiveConversationMutation } from "../hooks/useUnArchiveConversationMutation copy";

export default function Archived() {
  const { conversationId } = useParams();

  const { mutate } = useUnArchiveConversationMutation();
  return (
    <div className="flex w-full flex-col gap-2 items-center">
      <p className="text-sm  font-medium">This chat has been archived</p>
      <Button
        variant={"link"}
        onClick={() => {
          if (conversationId) mutate(conversationId);
        }}
      >
        Restore chat
      </Button>
    </div>
  );
}
