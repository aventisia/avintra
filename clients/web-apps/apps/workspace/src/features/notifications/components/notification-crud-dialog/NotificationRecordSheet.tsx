import { useCrudDialogRecordView } from "@avplatform/ui/crud-dialog";
import {
  NotificationRecurrenceEnum,
  NotificationStatusEnum,
  NotificationTypesEnum,
} from "@avplatform/ui/enums";
import {
  RecordFact,
  RecordFactGrid,
  RecordIdentifier,
  RecordIdentifiers,
  RecordSection,
  RecordSheet,
  RecordSheetLoading,
  RecordSheetUnavailable,
  RecordStatusHero,
  RecordSummary,
  type RecordTone,
  recordLabelClass,
} from "@avplatform/ui/record-sheet";
import type { IconProps } from "@avplatform/ui/types";
import { formatDate, formatRelativeTime } from "@avplatform/ui/utils";
import {
  AlarmIcon,
  ArrowSquareInIcon,
  BellIcon,
  BuildingsIcon,
  CalendarBlankIcon,
  CalendarCheckIcon,
  CalendarXIcon,
  ClockCounterClockwiseIcon,
  InfoIcon,
  LinkSimpleIcon,
  PaperPlaneTiltIcon,
  RepeatIcon,
  UserCircleIcon,
  UserGearIcon,
  UserListIcon,
  UsersThreeIcon,
  WarningIcon,
  WarningOctagonIcon,
} from "@phosphor-icons/react";
import { isFuture } from "date-fns";
import type { ComponentType } from "react";

import { PersonAvatar } from "@/components/PersonAvatar";

import { formatEnumLabel } from "../../constants/notifications-table.constant";
import type { NotificationDto } from "../../dtos/notification.dto";

const STATUS_TONES: Record<NotificationStatusEnum, RecordTone> = {
  [NotificationStatusEnum.Draft]: "neutral",
  [NotificationStatusEnum.Scheduled]: "warn",
  [NotificationStatusEnum.Sent]: "ok",
  [NotificationStatusEnum.Failed]: "bad",
};

const TYPE_ICONS: Record<NotificationTypesEnum, ComponentType<IconProps>> = {
  [NotificationTypesEnum.Information]: InfoIcon,
  [NotificationTypesEnum.Warning]: WarningIcon,
  [NotificationTypesEnum.Alert]: WarningOctagonIcon,
  [NotificationTypesEnum.Reminder]: AlarmIcon,
};

const getTimeline = (notification: NotificationDto) => {
  if (notification.status === NotificationStatusEnum.Scheduled && notification.scheduledFor) {
    const verb = isFuture(new Date(notification.scheduledFor)) ? "Sends" : "Due";
    return {
      description: `${verb} ${formatRelativeTime(notification.scheduledFor)}`,
      detail: formatDate(notification.scheduledFor, true),
    };
  }
  if (notification.sentOn) {
    return {
      description: `Sent ${formatRelativeTime(notification.sentOn)}`,
      detail: formatDate(notification.sentOn, true),
    };
  }
  return {
    description: notification.createdOn && `Created ${formatRelativeTime(notification.createdOn)}`,
    detail: notification.createdOn && formatDate(notification.createdOn, true),
  };
};

type NotificationRecordSheetProps = {
  notification?: NotificationDto;
  isLoading: boolean;
  /** Tenants the notification reaches; shown for super admin notifications. */
  tenantCount?: number;
};

/**
 * Read-only notification record: send status, message, delivery and audience facts, audit,
 * identifier and schedule.
 */
export const NotificationRecordSheet = ({
  notification,
  isLoading,
  tenantCount,
}: NotificationRecordSheetProps) => {
  useCrudDialogRecordView(notification?.title);

  if (isLoading) return <RecordSheetLoading label="Loading notification details..." />;
  if (!notification) return <RecordSheetUnavailable Icon={BellIcon} recordLabel="Notification" />;

  const { description, detail } = getTimeline(notification);
  const isRecurring =
    !!notification.recurrenceFrequency &&
    notification.recurrenceFrequency !== NotificationRecurrenceEnum.None;

  return (
    <RecordSheet>
      <RecordSummary>
        <RecordStatusHero
          Icon={TYPE_ICONS[notification.type] ?? BellIcon}
          tone={STATUS_TONES[notification.status] ?? "neutral"}
          title={formatEnumLabel(notification.status)}
          description={description}
          detail={detail}
        />
        <div className="px-4 py-3">
          <p className={recordLabelClass}>Message</p>
          <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-5 text-ink">
            {notification.message}
          </p>
        </div>
        <RecordFactGrid>
          <RecordFact
            Icon={TYPE_ICONS[notification.type] ?? BellIcon}
            label="Type"
            value={formatEnumLabel(notification.type)}
          />
          <RecordFact
            Icon={PaperPlaneTiltIcon}
            label="Delivery"
            value={formatEnumLabel(notification.deliveryChannel)}
          />
          <RecordFact
            Icon={ArrowSquareInIcon}
            label="Source"
            value={formatEnumLabel(notification.sourceType)}
          />
          <RecordFact
            Icon={UsersThreeIcon}
            label="Audience"
            value={formatEnumLabel(notification.audienceScope)}
          />
          <RecordFact
            Icon={UserListIcon}
            label="Recipients"
            value={notification.recipientCount.toLocaleString()}
          />
          {tenantCount !== undefined && (
            <RecordFact Icon={BuildingsIcon} label="Tenants" value={tenantCount.toLocaleString()} />
          )}
          <RecordFact
            Icon={LinkSimpleIcon}
            label="Action URL"
            value={
              notification.actionUrl && (
                <span className="font-mono text-[12.5px]">{notification.actionUrl}</span>
              )
            }
          />
        </RecordFactGrid>
        <RecordFactGrid>
          <RecordFact
            Icon={UserCircleIcon}
            label="Created by"
            value={notification.createdBy}
            prefix={
              notification.createdBy && <PersonAvatar name={notification.createdBy} size="sm" />
            }
          />
          <RecordFact
            Icon={CalendarBlankIcon}
            label="Created on"
            value={notification.createdOn && formatDate(notification.createdOn, true)}
          />
          <RecordFact
            Icon={UserGearIcon}
            label="Last modified by"
            value={notification.lastModifiedBy}
            prefix={
              notification.lastModifiedBy && (
                <PersonAvatar name={notification.lastModifiedBy} size="sm" />
              )
            }
          />
          <RecordFact
            Icon={ClockCounterClockwiseIcon}
            label="Last modified on"
            value={notification.lastModifiedOn && formatDate(notification.lastModifiedOn, true)}
          />
        </RecordFactGrid>
        <RecordIdentifiers>
          <RecordIdentifier label="Notification ID" value={notification.id} />
        </RecordIdentifiers>
      </RecordSummary>

      {(notification.scheduledFor || isRecurring) && (
        <RecordSection title="Schedule">
          <RecordSummary>
            <RecordFactGrid>
              <RecordFact
                Icon={CalendarCheckIcon}
                label="Scheduled for"
                value={notification.scheduledFor && formatDate(notification.scheduledFor, true)}
              />
              <RecordFact
                Icon={PaperPlaneTiltIcon}
                label="Sent on"
                value={notification.sentOn && formatDate(notification.sentOn, true)}
              />
              <RecordFact
                Icon={RepeatIcon}
                label="Recurrence"
                value={formatEnumLabel(notification.recurrenceFrequency)}
              />
              <RecordFact
                Icon={CalendarXIcon}
                label="Recurrence end"
                value={
                  notification.recurrenceEndOn && formatDate(notification.recurrenceEndOn, true)
                }
              />
            </RecordFactGrid>
          </RecordSummary>
        </RecordSection>
      )}
    </RecordSheet>
  );
};
