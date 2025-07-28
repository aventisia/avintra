//import { MoreParticipants } from "./MoreParticipants";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@aventisia/ui/avatar";
import { useShallow } from "zustand/react/shallow";
import { useShareStore } from "@/features/share-access/stores/share-store";
import { useFetchFlowUserList } from "../hooks/useFetchFlowUserList";
import { PlusIcon } from "lucide-react";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

/** The FacePile shows a list of faces or initials in a horizontal lockup.
 * Each circle represents a person. Many times this component is used when
 * sharing who has access to a specific view or file or when assigning a
 * user to a task within a workflow */
const FlowParticipantsFacePile = () => {
  const { data } = useFetchFlowUserList();

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  /** How many faces can be shown */
  const maxFacesCount = 3;
  const { setOpen } = useShareStore(
    useShallow((state) => ({
      setOpen: state.setShowDialog,
    })),
  );

  return (
    <div className={cn("flex flex-row-reverse items-center")}>
      <Tooltip key="share" delayDuration={0} content="Share Access">
        <Avatar
          onClick={() => setOpen(true)}
          className="-ml-4 h-8 w-8 cursor-pointer border-[2.2px] border-primary !bg-[#aba7e7] text-xs font-bold capitalize tracking-wider text-secondary transition-colors duration-300 hover:z-10 hover:border-slate-200"
        >
          <AvatarFallback className="bg-[#aba7e7]">
            <PlusIcon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </Tooltip>

      {data?.data
        ?.slice(0, maxFacesCount)
        ?.map(({ initials = "", avatarSrc, userFullName, type, userName }) => (
          <Tooltip
            delayDuration={0}
            key={userName}
            content={
              <div className="flex items-center gap-3 p-1">
                <Avatar className="h-8 w-8 border-[2.2px] border-primary !bg-[#aba7e7] text-xs font-bold capitalize tracking-wider text-secondary transition-colors duration-300 hover:z-10 hover:border-slate-200">
                  <AvatarImage src={avatarSrc} alt={initials} />
                  <AvatarFallback className="bg-[#aba7e7] capitalize">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="-mt-1 flex flex-col">
                  <h3 className="font-medium">{userFullName}</h3>
                  <span className="text-2xs text-muted-foreground">
                    {userName}
                  </span>
                  <span className="mt-0.5 text-2xs">{type}</span>
                </div>
              </div>
            }
          >
            <Avatar className="-ml-4 h-8 w-8 border-[2.2px] border-primary !bg-[#aba7e7] text-xs font-bold capitalize tracking-wider text-secondary transition-colors duration-300 hover:z-10 hover:border-slate-200">
              <AvatarImage src={avatarSrc} alt={initials} />
              <AvatarFallback className="bg-[#aba7e7] capitalize">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Tooltip>
        ))
        .reverse()}
      {userSession?.userInitials ? (
        <Tooltip
          key={"user"}
          content={
            <div className="flex items-center gap-3 p-1">
              <Avatar className="h-8 w-8 border-[2.2px] border-primary !bg-[#aba7e7] text-xs font-bold capitalize tracking-wider text-secondary transition-colors duration-300 hover:z-10 hover:border-slate-200">
                <AvatarImage src={""} alt={userSession?.userInitials} />
                <AvatarFallback className="bg-[#aba7e7] capitalize">
                  {userSession?.userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="-mt-1 flex flex-col">
                <h3 className="font-medium">{`${userSession?.firstName} ${userSession?.lastName}`}</h3>
                <span className="text-2xs text-muted-foreground">
                  {userSession?.email}
                </span>
                <span className="mt-0.5 text-2xs">
                  {currentFlow.accessType}
                </span>
              </div>
            </div>
          }
        >
          <Avatar className="-ml-4 h-8 w-8 border-[2.2px] border-primary !bg-[#aba7e7] text-xs font-bold capitalize tracking-wider text-secondary transition-colors duration-300 hover:z-10 hover:border-slate-200">
            <AvatarImage src={""} alt={userSession?.userInitials} />
            <AvatarFallback className="bg-[#aba7e7] capitalize">
              {userSession?.userInitials}
            </AvatarFallback>
          </Avatar>
        </Tooltip>
      ) : null}
    </div>
  );
};

export { FlowParticipantsFacePile };
