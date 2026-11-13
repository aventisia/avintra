import { PersonAvatar } from "@avplatform/ui/avatar";
import { Badge } from "@avplatform/ui/badge";
import { useCrudDialogRecordView } from "@avplatform/ui/crud-dialog";
import {
  RecordEmpty,
  RecordFact,
  RecordFactGrid,
  RecordIdentifier,
  RecordIdentifiers,
  RecordList,
  RecordListItem,
  RecordPanel,
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
  AppWindowIcon,
  CalendarBlankIcon,
  ClockCounterClockwiseIcon,
  LockKeyIcon,
  RobotIcon,
  ShieldIcon,
  UserCircleIcon,
  UserGearIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import { getNodeConfig } from "@/features/dynamic-config-panel";

import type { VaultCredentialDto } from "../../dtos/vault-credentials.dto";
import { VaultCredentialAppsEnum } from "../../enums/vault-credential-apps.enum";
import { useFetchVaultCredentials } from "../../hooks/useFetchVaultCredentials.hook";
import {
  AUTH_TYPE_OPTIONS,
  CustomApiToolAuthTypeEnum,
} from "../../vault-credential-config/constants/custom-api-tool-schema.constant";
import { getVaultCredentialAppIcon } from "../../vault-credential-config/constants/vault-credential-app-icon-mapper.constant";
import { vaultCredentialAppsSelectOptions } from "../../vault-credential-config/constants/vault-credential-app-select-options.constant";
import { isOAuthCredentialType } from "../../vault-credential-config/constants/vault-credential-oauth-types.constant";

const CUSTOM_API_TOOL = VaultCredentialAppsEnum[VaultCredentialAppsEnum.CustomApiTool];

const CONNECTION_TONES: Record<NonNullable<VaultCredentialDto["corsairStatus"]>, RecordTone> = {
  Connected: "ok",
  Pending: "warn",
  Expired: "bad",
  Failed: "bad",
  Unknown: "neutral",
};

type CustomApiToolData = {
  Type?: CustomApiToolAuthTypeEnum;
  Parameters?: Record<string, unknown>;
};

type VaultCredentialViewProps = {
  rowId: string;
};

/**
 * Read-only vault credential record: connection or enabled state, app and access facts, audit,
 * identifier and the names of the stored fields. Secret values are never rendered.
 */
export const VaultCredentialView = ({ rowId }: VaultCredentialViewProps) => {
  const { data, isLoading } = useFetchVaultCredentials();
  const credential = data?.data.find((item) => item.id === rowId);
  useCrudDialogRecordView(credential?.name);

  const isCustomApiTool = credential?.type === CUSTOM_API_TOOL;
  const { data: fieldConfig } = useQuery({
    queryKey: ["vaultCredentialFieldConfig", credential?.type],
    queryFn: () => getNodeConfig(credential?.type ?? ""),
    enabled: !!credential?.type && !isCustomApiTool,
    retry: false,
    staleTime: Infinity,
  });

  if (isLoading) return <RecordSheetLoading label="Loading credential details..." />;
  if (!credential) return <RecordSheetUnavailable Icon={ShieldIcon} recordLabel="Credential" />;

  const customApiToolData = credential.data as CustomApiToolData | undefined;
  const storedData = (isCustomApiTool ? customApiToolData?.Parameters : credential.data) ?? {};
  const storedFields = Object.keys(storedData).map((key) => ({
    key,
    label: fieldConfig?.find((field) => field.name === key)?.label ?? key,
  }));

  const isOAuth = isOAuthCredentialType(credential.type);
  const connectionStatus = isOAuth ? (credential.corsairStatus ?? "Unknown") : undefined;
  const lastChangedOn = credential.lastModifiedOn ?? credential.createdOn;
  const appLogo =
    import.meta.env.VITE_WORKSPACE_PATH.replace(/\/$/, "") +
    (getVaultCredentialAppIcon(credential.type) ?? "/brand-img/default-provider.svg");
  const appLabel =
    vaultCredentialAppsSelectOptions[
      VaultCredentialAppsEnum[credential.type as keyof typeof VaultCredentialAppsEnum]
    ]?.label ??
    vaultCredentialAppsSelectOptions[credential.type]?.label ??
    credential.type;

  return (
    <RecordSheet>
      <RecordSummary>
        <RecordStatusHero
          Icon={ShieldIcon}
          tone={
            connectionStatus
              ? CONNECTION_TONES[connectionStatus]
              : credential.isDisabled
                ? "neutral"
                : "ok"
          }
          title={connectionStatus ?? (credential.isDisabled ? "Disabled" : "Enabled")}
          description={lastChangedOn && `Updated ${formatRelativeTime(lastChangedOn)}`}
          isMuted={!!credential.isDisabled}
          aside={
            connectionStatus &&
            (credential.isDisabled ? (
              <Badge variant="destructive">Disabled</Badge>
            ) : (
              <Badge variant="outline" className="border-ok/35 text-ok">
                Enabled
              </Badge>
            ))
          }
        />
        <RecordFactGrid>
          <RecordFact
            Icon={AppWindowIcon}
            label="App"
            value={appLabel}
            prefix={<img src={appLogo} alt="" className="size-4 object-contain" />}
          />
          {isCustomApiTool && (
            <RecordFact
              Icon={LockKeyIcon}
              label="Authentication type"
              value={
                AUTH_TYPE_OPTIONS.find((option) => option.value === customApiToolData?.Type)?.label
              }
            />
          )}
          <RecordFact
            Icon={UsersThreeIcon}
            label="Your access"
            value={credential.accessLevel?.replace(/([A-Z])/g, " $1").trim()}
          />
          <RecordFact
            Icon={RobotIcon}
            label="Agent access"
            value={credential.isResourceAccessRestricted ? "Assigned agents only" : "All agents"}
          />
          <RecordFact
            Icon={UserCircleIcon}
            label="Created by"
            value={credential.createdBy}
            prefix={credential.createdBy && <PersonAvatar name={credential.createdBy} size="sm" />}
          />
          <RecordFact
            Icon={CalendarBlankIcon}
            label="Created on"
            value={credential.createdOn && formatDate(credential.createdOn, true)}
          />
          <RecordFact
            Icon={UserGearIcon}
            label="Last modified by"
            value={credential.lastModifiedBy}
            prefix={
              credential.lastModifiedBy && (
                <PersonAvatar name={credential.lastModifiedBy} size="sm" />
              )
            }
          />
          <RecordFact
            Icon={ClockCounterClockwiseIcon}
            label="Last modified on"
            value={credential.lastModifiedOn && formatDate(credential.lastModifiedOn, true)}
          />
        </RecordFactGrid>
        <RecordIdentifiers>
          <RecordIdentifier label="Credential ID" value={credential.id} />
        </RecordIdentifiers>
      </RecordSummary>

      {credential.description && (
        <RecordSection title="Description">
          <RecordPanel>
            <p className="whitespace-pre-wrap text-[13px] leading-5 text-ink">
              {credential.description}
            </p>
          </RecordPanel>
        </RecordSection>
      )}

      <RecordSection title="Stored fields" count={storedFields.length}>
        {storedFields.length > 0 ? (
          <RecordList>
            {storedFields.map((field) => (
              <RecordListItem key={field.key} className="px-4">
                <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">
                  {field.label}
                </p>
              </RecordListItem>
            ))}
          </RecordList>
        ) : (
          <RecordEmpty>No fields stored for this credential</RecordEmpty>
        )}
      </RecordSection>
    </RecordSheet>
  );
};
