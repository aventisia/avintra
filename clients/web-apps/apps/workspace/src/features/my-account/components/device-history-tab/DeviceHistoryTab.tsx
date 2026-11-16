import { LoadingSpinner, Skeleton } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { MetaLine } from "@avplatform/ui/meta-line";
import { DevicesIcon, SignOutIcon } from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { createPortal } from "react-dom";

import { StatusLine } from "@/components/card-dialog/StatusLine";
import { pluralize } from "@/utils/pluralize.util";

import type { ActiveSessionDto } from "../../dtos/active-session-dto";
import useGetDeviceHistory from "../../hooks/useGetDeviceHistory";
import { useTerminateSessionMutation } from "../../hooks/useTerminateSessionMutation";
import type { AccountTabProps } from "../../types/account-tab.type";

type SessionRowProps = {
  session: ActiveSessionDto;
  browserImage?: string;
  isCurrent: boolean;
  isSigningOut: boolean;
  onSignOut: () => void;
};

const SessionRow = ({
  session,
  browserImage,
  isCurrent,
  isSigningOut,
  onSignOut,
}: SessionRowProps) => {
  const isEnded = new Date(session.sessionExpiresOn) < new Date();

  return (
    <li className="flex items-center gap-3 px-3.5 py-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-sunken ring-1 ring-inset ring-line">
        {browserImage ? (
          <img alt="" src={browserImage} className="size-5" />
        ) : (
          <DevicesIcon className="size-5 text-ink-2" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-semibold text-ink">
            {session.browserType} on {session.operatingSystem}
          </span>
          {isCurrent && <Badge variant="completed">This device</Badge>}
        </div>
        <MetaLine
          className="text-[12px] text-muted-foreground"
          items={[
            isEnded ? "Ended" : "Active",
            `Signed in ${formatDistanceToNow(new Date(session.loggedInOn), { addSuffix: true })}`,
            <span key="device" className="font-mono" title={session.deviceId}>
              {session.deviceId}
            </span>,
          ]}
        />
      </div>
      <Button
        variant="caution"
        size="xs"
        onClick={onSignOut}
        disabled={isSigningOut}
        aria-label={`Sign out ${session.browserType} on ${session.operatingSystem}`}
      >
        {isSigningOut ? (
          <LoadingSpinner className="size-3.5" />
        ) : (
          <SignOutIcon className="size-3.5" />
        )}
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </li>
  );
};

export const DeviceHistoryTab = ({ footerSlot }: AccountTabProps) => {
  const [currTermination, setCurrTermination] = useState<string>("");

  const { isLoading, activeSessions, currentSession, getImageSourceOfBrowser } =
    useGetDeviceHistory();
  const { mutate: terminateSession, isPending } = useTerminateSessionMutation();

  const isCurrentSession = (session: ActiveSessionDto) =>
    session.refreshToken === currentSession?.refreshToken;
  const sortedSessions = [...activeSessions].sort(
    (a, b) => Number(isCurrentSession(b)) - Number(isCurrentSession(a)),
  );

  return (
    <>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : sortedSessions.length === 0 ? (
        <p className="text-body-sm text-muted-foreground">No devices are signed in.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-md ring-1 ring-line">
          {sortedSessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              browserImage={getImageSourceOfBrowser(session.browserType)}
              isCurrent={isCurrentSession(session)}
              isSigningOut={isPending && currTermination === session.id}
              onSignOut={() => {
                setCurrTermination(session.id);
                terminateSession([session.id]);
              }}
            />
          ))}
        </ul>
      )}

      {footerSlot &&
        createPortal(
          <StatusLine tone="idle">
            {isLoading
              ? "Loading devices"
              : `${activeSessions.length} signed-in ${pluralize(activeSessions.length, "device")}`}
          </StatusLine>,
          footerSlot,
        )}
    </>
  );
};
