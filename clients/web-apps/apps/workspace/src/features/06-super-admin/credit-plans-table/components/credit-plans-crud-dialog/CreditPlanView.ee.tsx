import { PersonAvatar } from "@avplatform/ui/avatar";
import { useCrudDialogRecordView } from "@avplatform/ui/crud-dialog";
import {
  RecordFact,
  RecordFactGrid,
  RecordIdentifier,
  RecordIdentifiers,
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
  CoinsIcon,
  HashIcon,
  RulerIcon,
  StackIcon,
  UserCircleIcon,
  UserGearIcon,
} from "@phosphor-icons/react";

import { ServiceTypeEnum } from "../../enums/service-type-enum.ee";
import { UnitTypeEnum } from "../../enums/unit-type-enum.ee";
import { useFetchCreditPlans } from "../../hooks/useFetchCreditPlans.ee";

type CreditPlanViewProps = {
  rowId: string;
};

/**
 * Read-only credit plan record: enabled state, pricing facts, audit and identifier.
 */
export const CreditPlanView = ({ rowId }: CreditPlanViewProps) => {
  const { data: response, isLoading } = useFetchCreditPlans();

  const plan = response?.data.find((item) => item.id === rowId);
  const serviceTypeLabel =
    plan && (ServiceTypeEnum[plan.serviceType as keyof typeof ServiceTypeEnum] ?? plan.serviceType);
  useCrudDialogRecordView(serviceTypeLabel);

  if (isLoading) return <RecordSheetLoading label="Loading credit plan details..." />;
  if (!plan) return <RecordSheetUnavailable Icon={CoinsIcon} recordLabel="Credit plan" />;

  const lastChangedOn = plan.lastModifiedOn ?? plan.createdOn;

  return (
    <RecordSheet>
      <RecordSummary>
        <RecordStatusHero
          Icon={CoinsIcon}
          tone={plan.isDisabled ? "neutral" : "ok"}
          title={plan.isDisabled ? "Disabled" : "Enabled"}
          description={
            lastChangedOn ? `Last updated ${formatRelativeTime(lastChangedOn)}` : undefined
          }
          detail={lastChangedOn && formatDate(lastChangedOn, true)}
          isMuted={plan.isDisabled}
        />
        <RecordFactGrid>
          <RecordFact Icon={StackIcon} label="Service type" value={serviceTypeLabel} />
          <RecordFact
            Icon={RulerIcon}
            label="Unit type"
            value={UnitTypeEnum[plan.unitType as keyof typeof UnitTypeEnum] ?? plan.unitType}
          />
          <RecordFact
            Icon={HashIcon}
            label="One unit"
            value={<span className="tabular-nums">{plan.oneUnit}</span>}
          />
          <RecordFact
            Icon={CoinsIcon}
            label="Credits"
            value={<span className="tabular-nums">{plan.credits}</span>}
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
        </RecordIdentifiers>
      </RecordSummary>
    </RecordSheet>
  );
};
