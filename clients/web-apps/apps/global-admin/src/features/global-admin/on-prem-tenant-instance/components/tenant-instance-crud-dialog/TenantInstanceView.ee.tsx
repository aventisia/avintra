import { Badge } from "@avplatform/ui/badge";
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
  type RecordTone,
} from "@avplatform/ui/record-sheet";
import { formatDate, formatRelativeTime } from "@avplatform/ui/utils";
import {
  CloudArrowUpIcon,
  GitBranchIcon,
  HardDrivesIcon,
  TagIcon,
  WarningIcon,
} from "@phosphor-icons/react";

import { INSTANCE_TYPE_LABELS } from "../../constants/tenant-instance-field-props.constant.ee";
import type { OnPremInstanceDto } from "../../dtos/tenant-instance-dto.ee";
import { useFetchTenantInstances } from "../../hooks/useFetchTenantInstances.ee";
import { useTenantRoute } from "../../hooks/useTenantRoute.ee";

const getInstanceStatus = (instance: OnPremInstanceDto): { label: string; tone: RecordTone } => {
  if (instance.noOfInvalidCheck > 0) {
    return {
      label: `${instance.noOfInvalidCheck} invalid ${instance.noOfInvalidCheck === 1 ? "check" : "checks"}`,
      tone: "warn",
    };
  }
  if (!instance.lastValidatedOn) return { label: "Not validated", tone: "neutral" };
  return { label: "Valid", tone: "ok" };
};

type TenantInstanceViewProps = {
  rowId: string;
};

/**
 * Read-only on-prem instance record: validation state, deployment facts and identifiers.
 */
export const TenantInstanceView = ({ rowId }: TenantInstanceViewProps) => {
  const { tid } = useTenantRoute();

  const { data: response, isLoading } = useFetchTenantInstances(tid ?? "");
  const instance = response?.data?.find((item) => item.id === rowId);

  useCrudDialogRecordView(instance?.name);

  if (isLoading) return <RecordSheetLoading label="Loading instance details..." />;
  if (!instance) return <RecordSheetUnavailable Icon={HardDrivesIcon} recordLabel="Instance" />;

  const status = getInstanceStatus(instance);

  return (
    <RecordSheet>
      <RecordSummary>
        <RecordStatusHero
          Icon={HardDrivesIcon}
          tone={instance.isDisabled ? "neutral" : status.tone}
          title={status.label}
          description={
            instance.lastValidatedOn
              ? `Last validated ${formatRelativeTime(instance.lastValidatedOn)}`
              : "Never validated"
          }
          detail={instance.lastValidatedOn && formatDate(instance.lastValidatedOn, true)}
          isMuted={instance.isDisabled}
          aside={
            instance.isDisabled ? (
              <Badge variant="destructive">Disabled</Badge>
            ) : (
              <Badge variant="outline" className="border-ok/35 text-ok">
                Enabled
              </Badge>
            )
          }
        />
        <RecordFactGrid>
          <RecordFact
            Icon={TagIcon}
            label="Instance type"
            value={INSTANCE_TYPE_LABELS[instance.type] ?? instance.type}
          />
          <RecordFact
            Icon={GitBranchIcon}
            label="Platform version"
            value={
              instance.platformVersion && (
                <span className="font-mono">v{instance.platformVersion}</span>
              )
            }
          />
          <RecordFact
            Icon={CloudArrowUpIcon}
            label="Deployed at"
            value={instance.deployedOn && formatDate(instance.deployedOn, true)}
          />
          <RecordFact
            Icon={WarningIcon}
            label="Invalid checks"
            value={<span className="tabular-nums">{instance.noOfInvalidCheck ?? 0}</span>}
          />
        </RecordFactGrid>
        <RecordIdentifiers>
          <RecordIdentifier label="Instance ID" value={instance.id} />
          <RecordIdentifier label="Tenant ID" value={instance.onPremTenantId} />
        </RecordIdentifiers>
      </RecordSummary>
    </RecordSheet>
  );
};
