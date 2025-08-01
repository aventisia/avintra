import { cn } from "@aventisia/ui/lib";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useShallow } from "zustand/react/shallow";
import { useFetchFlowUserList } from "../../hooks/useFetchFlowUserList";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useShareStore } from "@/features/share-access/stores/share-store";
import { Participant } from "../../constants/types";
import { useTooltipController } from "../../hooks/ useTooltipController";
import { FacePileTooltip } from "./FacePileTooltip";
import { ShareAccessButton } from "./ShareAccessButton";
import { ParticipantAvatar } from "./ParticipantAvatar";

export const FlowParticipantsFacePile = () => {
  const { data } = useFetchFlowUserList();
  const { userSession } = useUserSessionStore(
    useShallow((s) => ({ userSession: s.userSession })),
  );
  const { currentFlow } = useCurrentFlowStore(
    useShallow((s) => ({ currentFlow: s.currentFlow })),
  );
  const { setOpen } = useShareStore(
    useShallow((s) => ({ setOpen: s.setShowDialog })),
  );

  const participants: Participant[] = (data?.data ?? [])
    .slice(0, 3)
    .reverse()
    .map((p) => ({
      userName: p.userName || "",
      userFullName: p.userFullName || "",
      avatarSrc: p.avatarSrc || "",
      initials: p.initials || "",
      type: p.type,
    }));

  const {
    tooltipData,
    isTooltipVisible,
    showTooltipFor,
    hideTooltipWithDelay,
    cancelHideTooltip,
  } = useTooltipController();

  const currentUser: Participant | null = userSession?.userInitials
    ? {
        userName: userSession.email,
        userFullName: `${userSession.firstName} ${userSession.lastName}`,
        initials: userSession.userInitials,
        type: currentFlow.accessType,
        isCurrentUser: true,
      }
    : null;

  return (
    <Tooltip.Provider>
      <div className={cn("flex flex-row-reverse items-center")}>
        <FacePileTooltip
          open={isTooltipVisible}
          data={tooltipData}
          onEnter={cancelHideTooltip}
          onLeave={hideTooltipWithDelay}
        />

        <ShareAccessButton onClick={() => setOpen(true)} />

        {participants.map((p) => (
          <ParticipantAvatar
            key={p.userName}
            user={p}
            onHoverStart={showTooltipFor}
            onHoverEnd={hideTooltipWithDelay}
            onCancel={cancelHideTooltip}
          />
        ))}

        {currentUser && (
          <ParticipantAvatar
            user={currentUser}
            onHoverStart={showTooltipFor}
            onHoverEnd={hideTooltipWithDelay}
            onCancel={cancelHideTooltip}
          />
        )}
      </div>
    </Tooltip.Provider>
  );
};
