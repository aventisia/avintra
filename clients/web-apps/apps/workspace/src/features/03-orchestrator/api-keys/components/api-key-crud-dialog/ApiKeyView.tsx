import { CopyableText, LoadingSpinner, NoContentMessage, Separator } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import {
  AuditTrailCard,
  ViewContainer,
  ViewDefaultCard,
  ViewField,
} from "@avplatform/ui/components/view-record";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { formatDate } from "@avplatform/ui/utils";
import { useQuery } from "@tanstack/react-query";
import { KeyIcon, ShieldCheckIcon } from "lucide-react";

import { getApiKey } from "../../apis/api-key.apis";
import { API_KEY_PERMISSION_ITEMS } from "../../constants/api-key-permissions.constant";
import type { ApiKeyDto } from "../../dtos/api-key.dto";
import { getApiKeyStatus } from "../../utils/api-key-status.util";

interface ApiKeyViewProps {
  rowId: string;
}

export const ApiKeyView = ({ rowId }: ApiKeyViewProps) => {
  const { data: response, isLoading } = useQuery({
    queryKey: ["apiKey", rowId],
    queryFn: () => getApiKey(rowId),
    enabled: !!rowId,
  });

  const apiKey = response?.data as ApiKeyDto | undefined;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col text-sm gap-3 items-center justify-center">
        <LoadingSpinner className="size-8 text-primary" />
        Loading API key details...
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <NoContentMessage
          className="-mt-20"
          Icon={KeyIcon}
          primaryMessage="API key record is not available."
          secondaryMessage="Try refreshing the page and opening this record again."
        />
      </div>
    );
  }

  return (
    <ViewContainer>
      <ViewDefaultCard>
        <div className="flex flex-col gap-1">
          <span
            className="truncate max-w-[24rem] text-base font-medium leading-tight"
            title={`API Key Name: ${apiKey.name}`}
          >
            {apiKey.name}
          </span>
          <CopyableText
            className="mt-0.5 w-full"
            textClassName="font-mono max-w-[24rem] text-sm font-medium text-muted-foreground"
            value={apiKey.id ?? FALLBACK_VALUE}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {(() => {
            const status = getApiKeyStatus(apiKey.expiresAt, apiKey.isRevoked);
            return (
              <Badge className={status.className} variant={status.variant}>
                {status.label}
              </Badge>
            );
          })()}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ViewField
            label="Secret Key"
            className="font-mono"
            value={apiKey.keyPrefix ?? FALLBACK_VALUE}
          />
          <ViewField label="Expires At" value={formatDate(apiKey.expiresAt, true)} />
          <ViewField label="Last Used" value={formatDate(apiKey.lastUsedAt, true)} />
        </div>
      </ViewDefaultCard>

      <ViewDefaultCard>
        <div className="flex items-center gap-1.5">
          <ShieldCheckIcon className="size-3.5 text-muted-foreground" />
          <p className="text-2xs uppercase tracking-wide text-muted-foreground">Feature Access</p>
        </div>
        <div className="grid grid-cols-1">
          {API_KEY_PERMISSION_ITEMS.map((item, index) => {
            const isEnabled = apiKey.permissions?.[item.id] ?? false;
            return (
              <div key={item.id}>
                <div className="flex items-center justify-between gap-6 py-2">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-xs font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                  <Badge variant={isEnabled ? "default" : "outline"}>
                    {isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                {index < API_KEY_PERMISSION_ITEMS.length - 1 && <Separator className="h-[0.5px]" />}
              </div>
            );
          })}
        </div>
      </ViewDefaultCard>

      <AuditTrailCard
        createdBy={apiKey.createdBy ?? undefined}
        createdOn={apiKey.createdOn ? new Date(apiKey.createdOn) : undefined}
        lastModifiedBy={apiKey.lastModifiedBy ?? undefined}
        lastModifiedOn={apiKey.lastModifiedOn ? new Date(apiKey.lastModifiedOn) : undefined}
      />
    </ViewContainer>
  );
};
