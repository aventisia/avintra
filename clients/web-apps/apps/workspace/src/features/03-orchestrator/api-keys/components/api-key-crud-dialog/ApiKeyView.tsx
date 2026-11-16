import { PersonAvatar } from "@avplatform/ui/avatar";
import { useCrudDialogRecordView } from "@avplatform/ui/crud-dialog";
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
  CalendarXIcon,
  ClockCounterClockwiseIcon,
  KeyIcon,
  PasswordIcon,
  UserCircleIcon,
  UserGearIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import { getApiKey } from "../../apis/api-key.apis";
import { API_KEY_PERMISSION_ITEMS } from "../../constants/api-key-permissions.constant";
import type { ApiKeyDto } from "../../dtos/api-key.dto";
import { getApiKeyStatus } from "../../utils/api-key-status.util";

type ApiKeyViewProps = {
  rowId: string;
};

/**
 * Read-only API key record: key status and last use, key facts and audit, identifier and
 * feature access.
 */
export const ApiKeyView = ({ rowId }: ApiKeyViewProps) => {
  const { data: response, isLoading } = useQuery({
    queryKey: ["apiKey", rowId],
    queryFn: () => getApiKey(rowId),
    enabled: !!rowId,
  });

  const apiKey = response?.data as ApiKeyDto | undefined;
  useCrudDialogRecordView(apiKey?.name);

  if (isLoading) return <RecordSheetLoading label="Loading API key details..." />;
  if (!apiKey) return <RecordSheetUnavailable Icon={KeyIcon} recordLabel="API key" />;

  const status = getApiKeyStatus(apiKey.expiresAt, apiKey.isRevoked);
  const enabledCount = API_KEY_PERMISSION_ITEMS.filter(
    (item) => apiKey.permissions?.[item.id],
  ).length;

  return (
    <RecordSheet>
      <RecordSummary>
        <RecordStatusHero
          Icon={KeyIcon}
          tone={status.tone}
          title={status.label}
          description={
            apiKey.lastUsedAt ? `Last used ${formatRelativeTime(apiKey.lastUsedAt)}` : "Never used"
          }
          detail={apiKey.lastUsedAt && formatDate(apiKey.lastUsedAt, true)}
          isMuted={status.tone === "bad" || status.tone === "neutral"}
        />
        <RecordFactGrid>
          <RecordFact
            Icon={PasswordIcon}
            label="Secret key"
            value={apiKey.keyPrefix && <span className="font-mono">{apiKey.keyPrefix}</span>}
          />
          <RecordFact
            Icon={CalendarXIcon}
            label="Expires at"
            value={apiKey.expiresAt ? formatDate(apiKey.expiresAt, true) : "Never"}
          />
          <RecordFact
            Icon={UserCircleIcon}
            label="Created by"
            value={apiKey.createdBy}
            prefix={apiKey.createdBy && <PersonAvatar name={apiKey.createdBy} size="sm" />}
          />
          <RecordFact
            Icon={CalendarBlankIcon}
            label="Created on"
            value={apiKey.createdOn && formatDate(apiKey.createdOn, true)}
          />
          <RecordFact
            Icon={UserGearIcon}
            label="Last modified by"
            value={apiKey.lastModifiedBy}
            prefix={
              apiKey.lastModifiedBy && <PersonAvatar name={apiKey.lastModifiedBy} size="sm" />
            }
          />
          <RecordFact
            Icon={ClockCounterClockwiseIcon}
            label="Last modified on"
            value={apiKey.lastModifiedOn && formatDate(apiKey.lastModifiedOn, true)}
          />
        </RecordFactGrid>
        <RecordIdentifiers>
          <RecordIdentifier label="API key ID" value={apiKey.id} />
        </RecordIdentifiers>
      </RecordSummary>

      <RecordSection
        title="Feature access"
        action={
          <span className="text-[12px] tabular-nums text-muted-foreground">
            {enabledCount} of {API_KEY_PERMISSION_ITEMS.length} enabled
          </span>
        }
      >
        <RecordList>
          {API_KEY_PERMISSION_ITEMS.map((item) => {
            const isEnabled = apiKey.permissions?.[item.id] ?? false;

            return (
              <RecordListItem key={item.id} className="gap-6 px-4">
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-[13px] font-medium",
                      isEnabled ? "text-ink" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="text-[12px] text-muted-foreground">{item.description}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 text-xs",
                    isEnabled ? "text-ok" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn("size-1.5 rounded-full", isEnabled ? "bg-ok" : "bg-line-strong")}
                  />
                  {isEnabled ? "Enabled" : "Disabled"}
                </span>
              </RecordListItem>
            );
          })}
        </RecordList>
      </RecordSection>
    </RecordSheet>
  );
};
