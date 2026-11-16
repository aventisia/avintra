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
  ArrowsClockwiseIcon,
  CalendarBlankIcon,
  CalendarXIcon,
  ClockCounterClockwiseIcon,
  EnvelopeIcon,
  FolderIcon,
  GlobeIcon,
  HourglassIcon,
  KeyIcon,
  PlugsIcon,
  UserCircleIcon,
  UserGearIcon,
} from "@phosphor-icons/react";

import { TriggerAgentsSection } from "../../../components/TriggerAgentsSection";
import { getSubscriptionStatus } from "../../../utils/get-subscription-status.util";
import { useFetchTriggerAgents } from "../../hooks/useFetchTriggerAgents";
import { useFetchTriggers } from "../../hooks/useFetchTriggers";

type EmailTriggerViewProps = {
  rowId: string;
};

/**
 * Read-only email trigger record: subscription status, mailbox facts and audit, identifiers
 * and the agents it runs.
 */
export const EmailTriggerView = ({ rowId }: EmailTriggerViewProps) => {
  const { data: triggers, isLoading } = useFetchTriggers();
  const {
    data: agentsResponse,
    isLoading: areAgentsLoading,
    isError: isAgentsError,
  } = useFetchTriggerAgents(rowId);

  const trigger = triggers?.data.find((item) => item.id === rowId);
  useCrudDialogRecordView(trigger?.name);

  if (isLoading || areAgentsLoading) {
    return <RecordSheetLoading label="Loading email trigger details..." />;
  }
  if (!trigger) return <RecordSheetUnavailable Icon={EnvelopeIcon} recordLabel="Email trigger" />;

  const status = getSubscriptionStatus(trigger);
  const agents = agentsResponse?.data ?? [];

  return (
    <RecordSheet>
      <RecordSummary>
        <RecordStatusHero
          Icon={EnvelopeIcon}
          tone={status.tone}
          title={status.title}
          description={`${status.isExpired ? "Expired" : "Expires"} ${formatRelativeTime(trigger.expiryDateTime)}`}
          detail={formatDate(trigger.expiryDateTime, true)}
          isMuted={status.tone !== "ok"}
        />
        <RecordFactGrid>
          <RecordFact Icon={PlugsIcon} label="Provider" value={trigger.provider} />
          <RecordFact Icon={KeyIcon} label="Credential" value={trigger.credentialName} />
          <RecordFact Icon={EnvelopeIcon} label="Mailbox" value={trigger.mailbox} />
          <RecordFact Icon={FolderIcon} label="Folder" value={trigger.folder} />
          <RecordFact Icon={GlobeIcon} label="Timezone" value={trigger.timezone} />
          <RecordFact
            Icon={HourglassIcon}
            label="Subscription period"
            value={
              trigger.resubscribeFrequency ? `${trigger.resubscribeFrequency} minutes` : undefined
            }
          />
          <RecordFact
            Icon={ArrowsClockwiseIcon}
            label="Resubscribe"
            value={trigger.resubscribeEnabled ? "On" : "Off"}
          />
          <RecordFact
            Icon={CalendarXIcon}
            label="Expires on"
            value={formatDate(trigger.expiryDateTime, true)}
          />
          <RecordFact
            Icon={UserCircleIcon}
            label="Created by"
            value={trigger.createdBy}
            prefix={trigger.createdBy && <PersonAvatar name={trigger.createdBy} size="sm" />}
          />
          <RecordFact
            Icon={CalendarBlankIcon}
            label="Created on"
            value={trigger.createdOn && formatDate(trigger.createdOn, true)}
          />
          <RecordFact
            Icon={UserGearIcon}
            label="Last modified by"
            value={trigger.lastModifiedBy}
            prefix={
              trigger.lastModifiedBy && <PersonAvatar name={trigger.lastModifiedBy} size="sm" />
            }
          />
          <RecordFact
            Icon={ClockCounterClockwiseIcon}
            label="Last modified on"
            value={trigger.lastModifiedOn && formatDate(trigger.lastModifiedOn, true)}
          />
        </RecordFactGrid>
        <RecordIdentifiers>
          <RecordIdentifier label="Trigger ID" value={trigger.id} />
          <RecordIdentifier label="Subscription ID" value={trigger.subscriptionId} />
        </RecordIdentifiers>
      </RecordSummary>

      <TriggerAgentsSection agents={agents} isError={isAgentsError} />
    </RecordSheet>
  );
};
