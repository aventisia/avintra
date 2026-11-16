import { PersonAvatar } from "@avplatform/ui/avatar";
import { Badge } from "@avplatform/ui/badge";
import { useCrudDialogRecordView } from "@avplatform/ui/crud-dialog";
import { cn } from "@avplatform/ui/lib";
import {
  RecordFact,
  RecordFactGrid,
  RecordIdentifier,
  RecordIdentifiers,
  RecordList,
  RecordListItem,
  RecordPanel,
  RecordSection,
  RecordSheet,
  RecordSheetLoading,
  RecordSheetUnavailable,
  RecordStatusHero,
  RecordSummary,
} from "@avplatform/ui/record-sheet";
import { formatDate } from "@avplatform/ui/utils";
import {
  BuildingsIcon,
  CalendarBlankIcon,
  ClockCounterClockwiseIcon,
  UserCircleIcon,
  UserGearIcon,
} from "@phosphor-icons/react";

import { AccessType, permissionTypes, roles } from "../../constants/permissions-and-acesses";
import { useFetchRoleById } from "../../hooks/useFetchRoleById";

const GRANTABLE_ACCESSES = permissionTypes
  .map((permission) => permission.id)
  .filter((access) => access !== AccessType.FullAccess);

type RoleViewProps = {
  rowId: string;
};

/**
 * Read-only role record: state, audit, identifier, description and per-feature access.
 */
export const RoleView = ({ rowId }: RoleViewProps) => {
  const { data: response, isLoading } = useFetchRoleById(rowId);

  const role = response?.data;
  useCrudDialogRecordView(role?.fullName);

  if (isLoading) return <RecordSheetLoading label="Loading role details..." />;
  if (!role) return <RecordSheetUnavailable Icon={UserGearIcon} recordLabel="Role" />;

  const getAccesses = (feature: string) =>
    role.rolePermissions?.find((permission) => permission.feature === feature)?.accesses ?? [];
  const grantedCount = roles.filter((feature) => getAccesses(feature.id).length > 0).length;

  return (
    <RecordSheet>
      <RecordSummary>
        <RecordStatusHero
          Icon={UserGearIcon}
          tone={role.isDisabled ? "bad" : "ok"}
          title={role.isDisabled ? "Disabled" : "Enabled"}
          description={`Access to ${grantedCount} of ${roles.length} features`}
          isMuted={role.isDisabled}
          aside={role.isDefault && <Badge variant="outline">Default role</Badge>}
        />
        <RecordFactGrid>
          <RecordFact
            Icon={UserCircleIcon}
            label="Created by"
            value={role.createdBy}
            prefix={role.createdBy && <PersonAvatar name={role.createdBy} size="sm" />}
          />
          <RecordFact
            Icon={CalendarBlankIcon}
            label="Created on"
            value={role.createdOn && formatDate(role.createdOn, true)}
          />
          <RecordFact
            Icon={UserGearIcon}
            label="Last modified by"
            value={role.lastUpdatedBy}
            prefix={role.lastUpdatedBy && <PersonAvatar name={role.lastUpdatedBy} size="sm" />}
          />
          <RecordFact
            Icon={ClockCounterClockwiseIcon}
            label="Last modified on"
            value={role.lastUpdatedOn && formatDate(role.lastUpdatedOn, true)}
          />
          {role.tenantName && (
            <RecordFact Icon={BuildingsIcon} label="Tenant" value={role.tenantName} />
          )}
        </RecordFactGrid>
        <RecordIdentifiers>
          <RecordIdentifier label="Role ID" value={role.id} />
        </RecordIdentifiers>
      </RecordSummary>

      {role.description && (
        <RecordSection title="Description">
          <RecordPanel className="whitespace-pre-wrap text-[13px] text-ink-2">
            {role.description}
          </RecordPanel>
        </RecordSection>
      )}

      <RecordSection
        title="Permissions"
        action={
          <span className="text-[12px] tabular-nums text-muted-foreground">
            {grantedCount} of {roles.length} features
          </span>
        }
      >
        <RecordList>
          {roles.map((feature) => {
            const accesses = getAccesses(feature.id);
            const hasFullAccess = GRANTABLE_ACCESSES.every((access) => accesses.includes(access));

            return (
              <RecordListItem key={feature.id} className="gap-6 px-4">
                <p
                  className={cn(
                    "min-w-0 flex-1 text-[13px] font-medium",
                    accesses.length > 0 ? "text-ink" : "text-muted-foreground",
                  )}
                >
                  {feature.name}
                </p>
                <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                  {hasFullAccess ? (
                    <Badge variant="outline" className="border-ok/35 text-ok">
                      Full access
                    </Badge>
                  ) : accesses.length > 0 ? (
                    accesses.map((access) => (
                      <Badge key={access} variant="outline">
                        {access}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No access</span>
                  )}
                </div>
              </RecordListItem>
            );
          })}
        </RecordList>
      </RecordSection>
    </RecordSheet>
  );
};
