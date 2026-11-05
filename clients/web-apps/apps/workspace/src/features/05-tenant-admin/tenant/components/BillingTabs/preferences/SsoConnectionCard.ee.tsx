import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { Card } from "@avplatform/ui/cards";
import { cn } from "@avplatform/ui/lib";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { useShallow } from "zustand/react/shallow";

import { ROLE_TA } from "@/constants/roles";
import {
  ssoAdminOnlyNotice,
  ssoConnectLabel,
  ssoConnectRequiredHint,
  ssoDisableWarningTitle,
  ssoDisabledTooltip,
  ssoEmailDomainLabel,
  ssoEnabledTooltip,
  ssoProviderInfoTooltip,
  ssoReconnectLabel,
  ssoStatusConnectedLabel,
  ssoToggleLabel,
} from "@/features/05-tenant-admin/tenant/constants/tenant-preferences-field-props.ee";

import TabLoader from "../TabLoader.ee";
import { useSsoConnectionCard } from "./hooks/useSsoConnectionCard.ee";

const workspaceBasePath = import.meta.env.VITE_WORKSPACE_PATH?.replace(/\/$/, "") || "";
const azureLogoUrl = `${workspaceBasePath}/brand-img/microsoft.svg`;

const SsoConnectionCard = () => {
  const {
    isLoading,
    isConnected,
    emailDomain,
    isSSOAvailable,
    isSSOEnabled,
    persistedSsoEnabled,
    ssoDisableWarning,
    connectHandler,
    isConnectPending,
    toggleSsoHandler,
    isTogglePending,
  } = useSsoConnectionCard();

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({ userSession: state.userSession })),
  );

  const isTenantAdmin = Boolean(userSession?.userRoles?.includes(ROLE_TA));
  const isConnectBlocked = !isConnected && !persistedSsoEnabled;
  const isToggleDisabled = isTogglePending || isConnectBlocked;
  const ssoToggleTooltip = isSSOEnabled ? ssoEnabledTooltip : ssoDisabledTooltip;

  if (isLoading) return <TabLoader />;
  if (!isSSOAvailable && !persistedSsoEnabled) return null;

  if (!isTenantAdmin) {
    return (
      <Card className="mb-6 p-4">
        <p className="text-sm text-muted-foreground">{ssoAdminOnlyNotice}</p>
      </Card>
    );
  }

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="flex items-start gap-3.5 p-5">
        <div className="shrink-0 rounded-md border border-line bg-sunken p-2.5">
          <img src={azureLogoUrl} alt="" className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <h3 className="text-sm font-semibold leading-none">Microsoft Entra ID</h3>
            <Tooltip content={ssoProviderInfoTooltip}>
              <span
                role="img"
                tabIndex={0}
                aria-label={ssoProviderInfoTooltip}
                className="cursor-help text-xs leading-none text-muted-foreground"
              >
                ⓘ
              </span>
            </Tooltip>
            {isConnected && <Badge variant="completed">{ssoStatusConnectedLabel}</Badge>}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Let members of your company domain sign in with your organization account.
          </p>
        </div>
      </div>

      {(emailDomain || ssoDisableWarning) && (
        <div className="px-5 pb-4">
          {isConnected && emailDomain && (
            <dl className="grid gap-1 text-sm">
              <div className="flex gap-2">
                <dt className="text-muted-foreground">{ssoEmailDomainLabel}</dt>
                <dd className="font-medium">{emailDomain}</dd>
              </div>
            </dl>
          )}

          {ssoDisableWarning && (
            <div className="mt-3 rounded-md border border-warn/35 bg-warn/10 p-3 text-sm text-ink">
              <p className="font-medium">{ssoDisableWarningTitle}</p>
              <p>
                {ssoDisableWarning.affectedUserCount} user(s) have no password and cannot sign in
                until they set one.
                {ssoDisableWarning.affectedAdmins.length > 0 &&
                  ` Affected admins: ${ssoDisableWarning.affectedAdmins.join(", ")}.`}
              </p>
              {ssoDisableWarning.recoveryHint && (
                <p className="mt-1">{ssoDisableWarning.recoveryHint}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-y-2 border-t border-line bg-sunken px-5 py-3">
        <div className="mr-auto flex items-center gap-2.5">
          <Tooltip content={ssoToggleTooltip}>
            <button
              type="button"
              role="switch"
              aria-checked={isSSOEnabled}
              aria-labelledby="sso-toggle-label"
              aria-describedby={isConnectBlocked ? "sso-toggle-hint" : undefined}
              disabled={isToggleDisabled}
              onClick={() => toggleSsoHandler(!isSSOEnabled)}
              className={cn(
                "relative h-5 w-[34px] shrink-0 rounded-full transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                isSSOEnabled ? "bg-indicator" : "bg-fill",
                isToggleDisabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full transition-[left] duration-150",
                  isSSOEnabled ? "left-[16px] bg-primary-foreground" : "left-0.5 bg-ink-2",
                )}
              />
            </button>
          </Tooltip>

          <div>
            <p
              id="sso-toggle-label"
              className={cn(
                "text-sm leading-none",
                isSSOEnabled && !isConnectBlocked
                  ? "font-medium text-ink"
                  : "text-muted-foreground",
              )}
            >
              {ssoToggleLabel}
            </p>
            {isConnectBlocked && (
              <p id="sso-toggle-hint" className="mt-0.5 text-xs text-muted-foreground">
                {ssoConnectRequiredHint}
              </p>
            )}
          </div>
        </div>

        {isSSOAvailable && (
          <Button
            type="button"
            onClick={connectHandler}
            disabled={isConnectPending}
            variant={isConnected ? "outline" : "default"}
            size="sm"
            className="shrink-0"
          >
            {isConnected ? ssoReconnectLabel : ssoConnectLabel}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default SsoConnectionCard;
