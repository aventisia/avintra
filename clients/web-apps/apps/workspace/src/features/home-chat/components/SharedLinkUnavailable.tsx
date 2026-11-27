import { EmptyState } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { LinkBreakIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

/** Shown when a read-only link was revoked or is wrong, with a way back to Home. */
export const SharedLinkUnavailable = ({ kind }: { kind: "chat" | "file" }) => {
  const navigate = useNavigate();
  return (
    <EmptyState
      Icon={LinkBreakIcon}
      primaryMessage="This link no longer works"
      secondaryMessage={`Sharing for this ${kind} was stopped, or the link is incomplete. Ask the person who shared it for a new link.`}
      action={<Button onClick={() => navigate("/")}>Go to Home</Button>}
    />
  );
};
