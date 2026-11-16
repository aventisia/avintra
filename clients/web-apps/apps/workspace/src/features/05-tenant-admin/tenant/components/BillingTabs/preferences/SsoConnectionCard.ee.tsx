import { Switch } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { RecordSection } from "@avplatform/ui/record-sheet";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { InfoIcon, LockKeyIcon, PlugsConnectedIcon, WarningIcon } from "@phosphor-icons/react";

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

  const isTenantAdmin = useUserSessionStore((state) =>
    Boolean(state.userSession?.userRoles?.includes(ROLE_TA)),
  );

  const isConnectBlocked = !isConnected && !persistedSsoEnabled;
  const isToggleDisabled = isTogglePending || isConnectBlocked;

  if (isLoading) return <TabLoader />;
  if (!isSSOAvailable && !persistedSsoEnabled) return null;

  if (!isTenantAdmin) {
    return (
      <RecordSection title="Single sign-on">
        <p className="flex items-start gap-2.5 rounded-lg bg-surface p-4 text-[12.5px] text-muted-foreground ring-1 ring-line">
          <LockKeyIcon className="mt-px size-4 shrink-0" />
          {ssoAdminOnlyNotice}
        </p>
      </RecordSection>
    );
  }

  return (
    <RecordSection title="Single sign-on">
      <div className="overflow-hidden rounded-lg bg-surface ring-1 ring-line">
        <div className="space-y-4 p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface shadow-sm ring-1 ring-line">
              <img src={azureLogoUrl} alt="" className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-[13.5px] font-semibold text-ink">Microsoft Entra ID</h3>
                <Tooltip content={ssoProviderInfoTooltip}>
                  <InfoIcon
                    tabIndex={0}
                    aria-label={ssoProviderInfoTooltip}
                    className="size-3.5 cursor-help text-muted-foreground outline-none focus-visible:text-ink"
                  />
                </Tooltip>
              </div>
              <span
                className={cn(
                  "mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-medium ring-1 ring-inset",
                  isConnected
                    ? "bg-ok/10 text-ok ring-ok/25"
                    : "bg-sunken text-muted-foreground ring-line",
                )}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {isConnected ? ssoStatusConnectedLabel : "Not connected"}
              </span>
            </div>
          </div>

          <p className="text-[12.5px] leading-5 text-ink-2">
            Let members of your company domain sign in with your organization account.
          </p>

          {isConnected && emailDomain && (
            <dl className="flex items-center justify-between gap-3 rounded-md bg-sunken/60 px-3 py-2 text-[12.5px] ring-1 ring-line">
              <dt className="text-muted-foreground">{ssoEmailDomainLabel}</dt>
              <dd className="truncate font-mono text-ink">{emailDomain}</dd>
            </dl>
          )}

          {ssoDisableWarning && (
            <div className="flex gap-2.5 rounded-md bg-warn/10 px-3 py-2.5 text-[12.5px] leading-5 text-ink ring-1 ring-warn/25">
              <WarningIcon className="mt-0.5 size-4 shrink-0 text-warn" />
              <div>
                <p className="font-medium">{ssoDisableWarningTitle}</p>
                <p className="text-ink-2">
                  {ssoDisableWarning.affectedUserCount} user(s) have no password and cannot sign in
                  until they set one.
                  {ssoDisableWarning.affectedAdmins.length > 0 &&
                    ` Affected admins: ${ssoDisableWarning.affectedAdmins.join(", ")}.`}
                </p>
                {ssoDisableWarning.recoveryHint && (
                  <p className="mt-1 text-ink-2">{ssoDisableWarning.recoveryHint}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-line bg-sunken/60 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <Tooltip content={isSSOEnabled ? ssoEnabledTooltip : ssoDisabledTooltip}>
              <span className="mt-px">
                <Switch
                  checked={isSSOEnabled}
                  disabled={isToggleDisabled}
                  onCheckedChange={toggleSsoHandler}
                  aria-labelledby="sso-toggle-label"
                  aria-describedby={isConnectBlocked ? "sso-toggle-hint" : undefined}
                />
              </span>
            </Tooltip>
            <div className="min-w-0">
              <p
                id="sso-toggle-label"
                className={cn(
                  "text-[13px] leading-5",
                  isSSOEnabled && !isConnectBlocked
                    ? "font-medium text-ink"
                    : "text-muted-foreground",
                )}
              >
                {ssoToggleLabel}
              </p>
              {isConnectBlocked && (
                <p id="sso-toggle-hint" className="text-[12px] leading-4 text-muted-foreground">
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
              aria-busy={isConnectPending}
              variant={isConnected ? "outline" : "default"}
              size="sm"
              className="w-full gap-1.5"
            >
              <PlugsConnectedIcon className="size-4" />
              {isConnected ? ssoReconnectLabel : ssoConnectLabel}
            </Button>
          )}
        </div>
      </div>
    </RecordSection>
  );
};

export default SsoConnectionCard;
