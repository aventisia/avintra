import { PersonAvatar } from "@avplatform/ui/avatar";
import { Badge } from "@avplatform/ui/badge";
import { useCrudDialogRecordView } from "@avplatform/ui/crud-dialog";
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
  type RecordTone,
} from "@avplatform/ui/record-sheet";
import { currencyFormater, formatDate } from "@avplatform/ui/utils";
import {
  CalendarBlankIcon,
  ClockCounterClockwiseIcon,
  CoinsIcon,
  CurrencyCircleDollarIcon,
  TagIcon,
  UserCircleIcon,
  UserGearIcon,
} from "@phosphor-icons/react";

import { displayValue } from "../../constants";
import { PlanStatusEnum } from "../../enums/plan-status-enum.ee";
import { useFetchSubPlans } from "../../hooks/useFetchSubPlans.ee";

const STATUS_TONES: Record<PlanStatusEnum, RecordTone> = {
  [PlanStatusEnum.Current]: "ok",
  [PlanStatusEnum.Custom]: "live",
  [PlanStatusEnum.Legacy]: "warn",
  [PlanStatusEnum.Archived]: "neutral",
};

type SubPlanViewProps = {
  rowId: string;
};

/**
 * Read-only subscription plan record: plan status and price, plan facts and audit, identifiers
 * and usage limits.
 */
export const SubPlanView = ({ rowId }: SubPlanViewProps) => {
  const { data: response, isLoading } = useFetchSubPlans();

  const plan = response?.data.find((item) => item.id === rowId);
  useCrudDialogRecordView(plan?.name);

  if (isLoading) return <RecordSheetLoading label="Loading subscription plan details..." />;
  if (!plan) {
    return (
      <RecordSheetUnavailable Icon={CurrencyCircleDollarIcon} recordLabel="Subscription plan" />
    );
  }

  const limits = [
    { label: "Credits", value: plan.maxCredits },
    { label: "Published agents", value: plan.maxPublishedItems },
    { label: "Users", value: plan.maxUsers },
    { label: "Spaces", value: plan.maxSpaces },
    { label: "Storage (MB)", value: plan.storageLimitMB },
    { label: "History retention (days)", value: plan.historyRetentionDays },
  ];

  return (
    <RecordSheet>
      <RecordSummary>
        <RecordStatusHero
          Icon={CurrencyCircleDollarIcon}
          tone={plan.isDisabled ? "neutral" : (STATUS_TONES[plan.status] ?? "neutral")}
          title={plan.status}
          description={`Billed ${plan.frequency.toLowerCase()}`}
          isMuted={plan.isDisabled}
          aside={plan.isDisabled && <Badge variant="destructive">Disabled</Badge>}
        />
        <RecordFactGrid>
          <RecordFact Icon={TagIcon} label="Type" value={plan.type} />
          <RecordFact
            Icon={CoinsIcon}
            label="Price"
            value={
              <span className="tabular-nums">{currencyFormater(plan.price, plan.currency)}</span>
            }
          />
          <RecordFact
            Icon={UserCircleIcon}
            label="Created by"
            value={plan.createdBy}
            prefix={plan.createdBy && <PersonAvatar name={plan.createdBy} size="sm" />}
          />
          <RecordFact
            Icon={CalendarBlankIcon}
            label="Created on"
            value={plan.createdOn && formatDate(plan.createdOn, true)}
          />
          <RecordFact
            Icon={UserGearIcon}
            label="Last modified by"
            value={plan.lastModifiedBy}
            prefix={plan.lastModifiedBy && <PersonAvatar name={plan.lastModifiedBy} size="sm" />}
          />
          <RecordFact
            Icon={ClockCounterClockwiseIcon}
            label="Last modified on"
            value={plan.lastModifiedOn && formatDate(plan.lastModifiedOn, true)}
          />
        </RecordFactGrid>
        <RecordIdentifiers>
          <RecordIdentifier label="Plan ID" value={plan.id} />
          <RecordIdentifier label="Unique name" value={plan.uniqueName} />
        </RecordIdentifiers>
      </RecordSummary>

      <RecordSection title="Limits">
        <RecordList>
          {limits.map((limit) => (
            <RecordListItem key={limit.label} className="justify-between px-4 text-[13px]">
              <span className="text-ink-2">{limit.label}</span>
              <span className="font-medium tabular-nums text-ink">{displayValue(limit.value)}</span>
            </RecordListItem>
          ))}
        </RecordList>
      </RecordSection>
    </RecordSheet>
  );
};
