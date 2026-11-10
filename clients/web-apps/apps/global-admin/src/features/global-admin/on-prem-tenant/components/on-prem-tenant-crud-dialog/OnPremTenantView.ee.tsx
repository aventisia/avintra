import { useCrudDialogRecordView } from "@avplatform/ui/crud-dialog";
import { cn } from "@avplatform/ui/lib";
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
  type RecordTone,
} from "@avplatform/ui/record-sheet";
import { formatDate, formatRelativeTime } from "@avplatform/ui/utils";
import {
  BuildingsIcon,
  CalendarBlankIcon,
  CalendarPlusIcon,
  ClockCounterClockwiseIcon,
  HourglassIcon,
  TagIcon,
  TimerIcon,
  UserCircleIcon,
  UserGearIcon,
} from "@phosphor-icons/react";

import { PersonAvatar } from "@/components/PersonAvatar";
import { formatSecondsToCompactDuration } from "@/utils/format-time-utils.ee";

import type { OnPremTenantDto } from "../../dtos/on-prem-tenant-dto.ee";
import { useFetchOnPremTenants } from "../../hooks/useFetchOnPremTenants.ee";

const getTenantStatus = (tenant: OnPremTenantDto): { label: string; tone: RecordTone } => {
  if (tenant.isLoginDisabled) return { label: "Login disabled", tone: "bad" };
  if (tenant.isExecutionDisabled) return { label: "Execution disabled", tone: "warn" };
  if (tenant.isAnyInstanceFailed) return { label: "Instance check failed", tone: "bad" };
  return { label: "Active", tone: "ok" };
};

const getRenewalDescription = (renewalDate: Date | string) => {
  const isPast = new Date(renewalDate).getTime() < Date.now();
  return `Contract ${isPast ? "renewal was due" : "renews"} ${formatRelativeTime(renewalDate)}`;
};

const splitEmails = (emails?: string | null) =>
  (emails ?? "")
    .split(";")
    .map((email) => email.trim())
    .filter(Boolean);

const ContactList = ({ title, emails }: { title: string; emails: string[] }) => (
  <RecordSection title={title} count={emails.length}>
    {emails.length > 0 ? (
      <RecordList>
        {emails.map((email) => (
          <RecordListItem key={email} className="text-body-sm">
            <PersonAvatar name={email} size="sm" />
            <a href={`mailto:${email}`} className="truncate text-ink hover:underline">
              {email}
            </a>
          </RecordListItem>
        ))}
      </RecordList>
    ) : (
      <RecordEmpty>No contacts added</RecordEmpty>
    )}
  </RecordSection>
);

type OnPremTenantViewProps = {
  rowId: string;
};

/**
 * Read-only on-prem tenant record: tenant state and contract renewal, contract and usage facts,
 * audit, granted features and contacts.
 */
export const OnPremTenantView = ({ rowId }: OnPremTenantViewProps) => {
  const { data: response, isLoading } = useFetchOnPremTenants();
  const tenant = response?.data?.find((item) => item.id === rowId);

  useCrudDialogRecordView(tenant?.name);

  if (isLoading) return <RecordSheetLoading label="Loading tenant details..." />;
  if (!tenant) return <RecordSheetUnavailable Icon={BuildingsIcon} recordLabel="Tenant" />;

  const status = getTenantStatus(tenant);
  const features = [
    { label: "Execution", isEnabled: !tenant.isExecutionDisabled },
    { label: "Login", isEnabled: !tenant.isLoginDisabled },
    { label: "Single sign-on", isEnabled: tenant.isSsoAllowed },
    { label: "Custom branding", isEnabled: tenant.isBrandingAllowed },
  ];

  return (
    <RecordSheet>
      <RecordSummary>
        <RecordStatusHero
          Icon={BuildingsIcon}
          tone={status.tone}
          title={status.label}
          description={
            tenant.contractRenewalDate && getRenewalDescription(tenant.contractRenewalDate)
          }
          detail={tenant.contractRenewalDate && formatDate(tenant.contractRenewalDate, true)}
          isMuted={tenant.isLoginDisabled}
        />
        <RecordFactGrid>
          <RecordFact Icon={TagIcon} label="Type" value={tenant.type} />
          <RecordFact
            Icon={CalendarPlusIcon}
            label="Contract start"
            value={tenant.contractStartDate && formatDate(tenant.contractStartDate, true)}
          />
          <RecordFact
            Icon={HourglassIcon}
            label="Execution hours allowed"
            value={<span className="tabular-nums">{tenant.executionTimeAllowed}</span>}
          />
          <RecordFact
            Icon={TimerIcon}
            label="Execution time consumed"
            value={
              <span className="tabular-nums">
                {formatSecondsToCompactDuration(tenant.consumedExecutionTime)}
              </span>
            }
          />
          <RecordFact
            Icon={UserCircleIcon}
            label="Created by"
            value={tenant.createdByUser}
            prefix={tenant.createdByUser && <PersonAvatar name={tenant.createdByUser} size="sm" />}
          />
          <RecordFact
            Icon={CalendarBlankIcon}
            label="Created on"
            value={tenant.createdOn && formatDate(tenant.createdOn, true)}
          />
          <RecordFact
            Icon={UserGearIcon}
            label="Last modified by"
            value={tenant.lastModifiedByUser}
            prefix={
              tenant.lastModifiedByUser && (
                <PersonAvatar name={tenant.lastModifiedByUser} size="sm" />
              )
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
        </RecordIdentifiers>
      </RecordSummary>

      <RecordSection
        title="Features"
        action={
          <span className="text-[12px] tabular-nums text-muted-foreground">
            {features.filter((feature) => feature.isEnabled).length} of {features.length} enabled
          </span>
        }
      >
        <RecordList>
          {features.map((feature) => (
            <RecordListItem key={feature.label} className="gap-6 px-4">
              <p
                className={cn(
                  "min-w-0 flex-1 text-[13px] font-medium",
                  feature.isEnabled ? "text-ink" : "text-muted-foreground",
                )}
              >
                {feature.label}
              </p>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 text-xs",
                  feature.isEnabled ? "text-ok" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    feature.isEnabled ? "bg-ok" : "bg-line-strong",
                  )}
                />
                {feature.isEnabled ? "Enabled" : "Disabled"}
              </span>
            </RecordListItem>
          ))}
        </RecordList>
      </RecordSection>

      <ContactList title="Aventisia contacts" emails={splitEmails(tenant.ourEmails)} />
      <ContactList title="Client contacts" emails={splitEmails(tenant.tenantEmails)} />
    </RecordSheet>
  );
};
