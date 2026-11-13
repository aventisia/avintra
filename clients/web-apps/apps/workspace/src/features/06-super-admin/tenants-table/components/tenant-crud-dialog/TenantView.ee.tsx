import { PersonAvatar } from "@avplatform/ui/avatar";
import { useCrudDialogRecordView } from "@avplatform/ui/crud-dialog";
import { DatabaseOptionsEnum } from "@avplatform/ui/enums/database-options-enum";
import { cn } from "@avplatform/ui/lib";
import {
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
  CalendarCheckIcon,
  ClockCounterClockwiseIcon,
  CloudIcon,
  CrownIcon,
  CurrencyCircleDollarIcon,
  GlobeIcon,
  IdentificationCardIcon,
  UserCircleIcon,
  UserGearIcon,
} from "@phosphor-icons/react";

import { dbOptionProps } from "../../constants/tenant-form-field-props.constant.ee";
import { useFetchTenants } from "../../hooks/useFetchTenants.ee";

type TenantViewProps = {
  rowId: string;
};

type Setting = { label: string; isEnabled: boolean; detail?: string };

const SettingList = ({ settings }: { settings: Setting[] }) => (
  <RecordList>
    {settings.map((setting) => (
      <RecordListItem key={setting.label} className="justify-between gap-6 px-4 text-[13px]">
        <span
          className={cn("font-medium", setting.isEnabled ? "text-ink" : "text-muted-foreground")}
        >
          {setting.label}
        </span>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 text-xs",
            setting.isEnabled ? "text-ok" : "text-muted-foreground",
          )}
        >
          <span
            className={cn("size-1.5 rounded-full", setting.isEnabled ? "bg-ok" : "bg-line-strong")}
          />
          {setting.detail ?? (setting.isEnabled ? "Enabled" : "Disabled")}
        </span>
      </RecordListItem>
    ))}
  </RecordList>
);

/**
 * Read-only tenant record: contract state, tenant facts and audit, identifiers, sign-in
 * settings and database setup.
 */
export const TenantView = ({ rowId }: TenantViewProps) => {
  const { data: response, isLoading } = useFetchTenants();

  const tenant = response?.data.find((item) => item.id === rowId);
  useCrudDialogRecordView(tenant?.name);

  if (isLoading) return <RecordSheetLoading label="Loading tenant details..." />;
  if (!tenant) return <RecordSheetUnavailable Icon={IdentificationCardIcon} recordLabel="Tenant" />;

  const signInSettings: Setting[] = [
    { label: "Password login", isEnabled: tenant.isPwdEnabled ?? false },
    { label: "Single sign-on (SSO)", isEnabled: tenant.isSSOEnabled ?? false },
    { label: "Two-factor authentication", isEnabled: tenant.isTwoFAEnabled ?? false },
    {
      label: "Password expiry",
      isEnabled: !tenant.isPwdNeverExpiresEnabled,
      detail: tenant.isPwdNeverExpiresEnabled
        ? "Never"
        : `After ${tenant.daysBeforePwdExpires} days`,
    },
    {
      label: "Idle session timeout",
      isEnabled: tenant.isIdleSessionTimeoutEnabled ?? false,
      detail: tenant.isIdleSessionTimeoutEnabled
        ? `After ${tenant.idleSessionTimeoutMinutes} minutes`
        : undefined,
    },
    { label: "Change requests", isEnabled: tenant.isChangeRequestEnabled ?? false },
  ];

  const dbOption = tenant.dbOption ?? DatabaseOptionsEnum.Shared;
  const dbOptionLabel =
    dbOptionProps.selectOptions.find((option) => option.value === dbOption)?.label ?? dbOption;
  const renewalDate =
    tenant.renewalDate && new Date(tenant.renewalDate).getFullYear() >= 1900
      ? tenant.renewalDate
      : undefined;

  return (
    <RecordSheet>
      <RecordSummary>
        <RecordStatusHero
          Icon={IdentificationCardIcon}
          tone={tenant.isDisabled ? "neutral" : "ok"}
          title={tenant.isDisabled ? "Disabled" : "Active"}
          description={
            renewalDate ? `Contract renews ${formatRelativeTime(renewalDate)}` : undefined
          }
          detail={renewalDate && formatDate(renewalDate, true)}
          isMuted={tenant.isDisabled}
        />
        <RecordFactGrid>
          <RecordFact Icon={GlobeIcon} label="Domain" value={tenant.domain} />
          <RecordFact Icon={CloudIcon} label="Type" value={tenant.type} />
          <RecordFact Icon={CurrencyCircleDollarIcon} label="Currency" value={tenant.currency} />
          <RecordFact Icon={CrownIcon} label="Plan" value={tenant.activePlan} />
          <RecordFact
            Icon={CalendarCheckIcon}
            label="Contract starts"
            value={tenant.effectiveDate && formatDate(tenant.effectiveDate, true)}
          />
          <RecordFact
            Icon={CalendarBlankIcon}
            label="Contract renews"
            value={renewalDate && formatDate(renewalDate, true)}
          />
          <RecordFact
            Icon={UserCircleIcon}
            label="Created by"
            value={tenant.createdBy}
            prefix={tenant.createdBy && <PersonAvatar name={tenant.createdBy} size="sm" />}
          />
          <RecordFact
            Icon={CalendarBlankIcon}
            label="Created on"
            value={tenant.createdOn && formatDate(tenant.createdOn, true)}
          />
          <RecordFact
            Icon={UserGearIcon}
            label="Last modified by"
            value={tenant.lastModifiedBy}
            prefix={
              tenant.lastModifiedBy && <PersonAvatar name={tenant.lastModifiedBy} size="sm" />
            }
          />
          <RecordFact
            Icon={ClockCounterClockwiseIcon}
            label="Last modified on"
            value={tenant.lastModifiedOn && formatDate(tenant.lastModifiedOn, true)}
          />
        </RecordFactGrid>
        <RecordIdentifiers>
          <RecordIdentifier label="Tenant ID" value={tenant.id} />
          <RecordIdentifier label="Container" value={tenant.containerName} />
        </RecordIdentifiers>
      </RecordSummary>

      <RecordSection title="Sign-in and security">
        <SettingList settings={signInSettings} />
      </RecordSection>

      <RecordSection title="Database">
        <RecordSummary>
          <RecordFactGrid>
            <RecordFact label="Option" value={dbOptionLabel} />
          </RecordFactGrid>
        </RecordSummary>
      </RecordSection>
    </RecordSheet>
  );
};
