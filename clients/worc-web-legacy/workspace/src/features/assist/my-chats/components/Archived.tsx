import { Button } from "@aventisia/ui/buttons";
import { useParams } from "react-router-dom";

import { useUnArchiveConversationMutation } from "../hooks/useUnArchiveConversationMutation copy";

export default function Archived() {
  const { conversationId } = useParams();

  const { mutate } = useUnArchiveConversationMutation();
  return (
    <div className="flex flex-col gap-2 w-full items-center justify-center rounded-lg border  bg-muted px-4 py-3 text-muted-foreground text-sm">
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
