import { useCrudDialogRecordView } from "@avplatform/ui/crud-dialog";
import { JsonViewer, createCopyJsonAction } from "@avplatform/ui/json-viewer";
import {
  RecordFact,
  RecordFactGrid,
  RecordIdentifier,
  RecordIdentifiers,
  RecordPanel,
  RecordSection,
  RecordSheet,
  RecordSheetLoading,
  RecordSheetUnavailable,
  RecordStatusHero,
  RecordSummary,
} from "@avplatform/ui/record-sheet";
import { formatDate, formatRelativeTime } from "@avplatform/ui/utils";
import {
  ArrowBendUpLeftIcon,
  CalendarBlankIcon,
  ClockCounterClockwiseIcon,
  UserCircleIcon,
  UserGearIcon,
  WebhooksLogoIcon,
} from "@phosphor-icons/react";

import { PersonAvatar } from "@/components/PersonAvatar";

import { TriggerAgentsSection } from "../../../components/TriggerAgentsSection";
import { useFetchTriggerAgents } from "../../hooks/useFetchTriggerAgents";
import { useFetchTriggers } from "../../hooks/useFetchTriggers";

type WebhookTriggerViewProps = {
  rowId: string;
};

/**
 * Read-only webhook trigger record: enabled state, audit and callback facts, webhook URL and
 * identifier, the agent it runs and its input schema.
 */
export const WebhookTriggerView = ({ rowId }: WebhookTriggerViewProps) => {
  const { data: triggers, isLoading } = useFetchTriggers();
  const {
    data: agentsResponse,
    isLoading: areAgentsLoading,
    isError: isAgentsError,
  } = useFetchTriggerAgents(rowId);

  const trigger = triggers?.data.find((item) => item.id === rowId);
  useCrudDialogRecordView(trigger?.name);

  if (isLoading || areAgentsLoading) {
    return <RecordSheetLoading label="Loading webhook trigger details..." />;
  }
  if (!trigger) {
    return <RecordSheetUnavailable Icon={WebhooksLogoIcon} recordLabel="Webhook trigger" />;
  }

  const agents = agentsResponse?.data ?? [];
  const lastChangedOn = trigger.lastModifiedOn ?? trigger.createdOn;

  return (
    <RecordSheet>
      <RecordSummary>
        <RecordStatusHero
          Icon={WebhooksLogoIcon}
          tone={trigger.isDisabled ? "neutral" : "ok"}
          title={trigger.isDisabled ? "Disabled" : "Enabled"}
          description={lastChangedOn && `Last updated ${formatRelativeTime(lastChangedOn)}`}
          detail={lastChangedOn && formatDate(lastChangedOn, true)}
          isMuted={!!trigger.isDisabled}
        />
        <RecordFactGrid>
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
          <RecordFact Icon={ArrowBendUpLeftIcon} label="Callback URL" value={trigger.callbackUrl} />
        </RecordFactGrid>
        <RecordIdentifiers>
          <RecordIdentifier label="Webhook URL" value={trigger.webhookUrl} />
          <RecordIdentifier label="Trigger ID" value={trigger.id} />
        </RecordIdentifiers>
      </RecordSummary>

      <TriggerAgentsSection
        agents={agents}
        isError={isAgentsError}
        title="Agent"
        emptyMessage="No agent runs when this webhook is called"
      />

      {trigger.expectedPayloadSchema && (
        <RecordSection
          title="Input arguments schema"
          action={createCopyJsonAction(trigger.expectedPayloadSchema)}
        >
          <RecordPanel className="px-3 pb-1">
            <JsonViewer
              jsonData={trigger.expectedPayloadSchema}
              enableValueClipboard
              viewportClassName=""
              shortenTextAfterLength={70}
            />
          </RecordPanel>
        </RecordSection>
      )}
    </RecordSheet>
  );
};
