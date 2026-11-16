import { PersonAvatar } from "@avplatform/ui/avatar";
import { Badge } from "@avplatform/ui/badge";
import { useCrudDialogRecordView } from "@avplatform/ui/crud-dialog";
import {
  RecordEmpty,
  RecordFact,
  RecordFactGrid,
  RecordIdentifier,
  RecordIdentifiers,
  RecordList,
  RecordListItem,
  RecordSection,
  RecordSheet,
  RecordSheetLoading,
  RecordSheetUnavailable,
  RecordStatusHero,
  RecordSummary,
} from "@avplatform/ui/record-sheet";
import { formatDate, formatRelativeTime } from "@avplatform/ui/utils";
import {
  CalendarBlankIcon,
  ClockCounterClockwiseIcon,
  EnvelopeSimpleIcon,
  FolderSimpleUserIcon,
  LockIcon,
  PasswordIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  UserGearIcon,
  UserIcon,
} from "@phosphor-icons/react";

import { useFetchUserRoles } from "../../hooks/useFetchUserRoles";
import { useFetchUserSpaces } from "../../hooks/useFetchUserSpaces";
import { useFetchUsers } from "../../hooks/useFetchUsers";
import { getAccountStatus, isAccountLocked } from "../../utils/account-status.util";

type UserViewProps = {
  rowId: string;
};

/**
 * Read-only user record: account status, security facts and audit, identifier, roles and spaces.
 */
export const UserView = ({ rowId }: UserViewProps) => {
  const { data: response, isLoading } = useFetchUsers();
  const { data: roleOptions } = useFetchUserRoles();
  const { data: spaceOptions } = useFetchUserSpaces();

  const user = response?.data.find((item) => item.id === rowId);
  useCrudDialogRecordView(user && `${user.firstName} ${user.lastName}`);

  if (isLoading) return <RecordSheetLoading label="Loading user details..." />;
  if (!user) return <RecordSheetUnavailable Icon={UserIcon} recordLabel="User" />;

  const status = getAccountStatus(!!user.isDisabled, user.lockoutEnd);
  const isLocked = isAccountLocked(user.lockoutEnd);
  const roles = user.userRoles ?? [];
  const spaces = user.spaces ?? [];

  return (
    <RecordSheet>
      <RecordSummary>
        <RecordStatusHero
          Icon={UserIcon}
          tone={status.tone}
          title={status.label}
          description={user.email}
          isMuted={status.tone !== "ok"}
        />
        <RecordFactGrid>
          <RecordFact
            Icon={ShieldCheckIcon}
            label="Two-factor authentication"
            value={user.twoFactorEnabled ? "Enabled" : "Off"}
          />
          <RecordFact
            Icon={EnvelopeSimpleIcon}
            label="Email confirmed"
            value={user.emailConfirmed ? "Yes" : "Not yet"}
          />
          <RecordFact
            Icon={PasswordIcon}
            label="Password set"
            value={
              user.pwdSetOn
                ? `${formatRelativeTime(user.pwdSetOn)} (${formatDate(user.pwdSetOn)})`
                : "Not set yet"
            }
          />
          <RecordFact
            Icon={LockIcon}
            label="Lockout ends"
            value={isLocked ? formatDate(user.lockoutEnd, true) : "Not locked"}
          />
          <RecordFact
            Icon={UserCircleIcon}
            label="Created by"
            value={user.createdBy}
            prefix={user.createdBy && <PersonAvatar name={user.createdBy} size="sm" />}
          />
          <RecordFact
            Icon={CalendarBlankIcon}
            label="Created on"
            value={user.createdOn && formatDate(user.createdOn, true)}
          />
          <RecordFact
            Icon={UserGearIcon}
            label="Last modified by"
            value={user.lastModifiedBy}
            prefix={user.lastModifiedBy && <PersonAvatar name={user.lastModifiedBy} size="sm" />}
          />
          <RecordFact
            Icon={ClockCounterClockwiseIcon}
            label="Last modified on"
            value={user.lastModifiedOn && formatDate(user.lastModifiedOn, true)}
          />
        </RecordFactGrid>
        <RecordIdentifiers>
          <RecordIdentifier label="User ID" value={user.id} />
        </RecordIdentifiers>
      </RecordSummary>

      <RecordSection title="Roles" count={roles.length}>
        {roles.length > 0 ? (
          <RecordList>
            {roles.map((role) => (
              <RecordListItem key={role} className="text-[13px] font-medium text-ink">
                <UserGearIcon className="size-4 text-muted-foreground" />
                {roleOptions?.data.find((option) => option.value === role)?.label ?? role}
              </RecordListItem>
            ))}
          </RecordList>
        ) : (
          <RecordEmpty>No roles assigned to this user</RecordEmpty>
        )}
      </RecordSection>

      <RecordSection title="Spaces" count={spaces.length}>
        {spaces.length > 0 ? (
          <RecordList>
            {spaces.map((spaceId) => {
              const space = spaceOptions?.data.find((option) => option.value === spaceId);

              return (
                <RecordListItem key={spaceId} className="text-[13px] font-medium text-ink">
                  <FolderSimpleUserIcon className="size-4 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{space?.label ?? spaceId}</span>
                  {space?.isDefault && <Badge variant="outline">Default</Badge>}
                </RecordListItem>
              );
            })}
          </RecordList>
        ) : (
          <RecordEmpty>No spaces assigned to this user</RecordEmpty>
        )}
      </RecordSection>
    </RecordSheet>
  );
};
