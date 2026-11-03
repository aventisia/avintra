import { Badge } from "@avplatform/ui/badge";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { useCrudDialogRecordView } from "@avplatform/ui/crud-dialog";
import { MachineStatusEnum } from "@avplatform/ui/enums/machine-status-enum";
import { OsTypesEnum } from "@avplatform/ui/enums/os-types-enum";
import { cn } from "@avplatform/ui/lib";
import {
  RecordEmpty,
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
  type RecordTone,
} from "@avplatform/ui/record-sheet";
import type { IconProps } from "@avplatform/ui/types";
import { formatDate } from "@avplatform/ui/utils";
import {
  DesktopIcon,
  LinuxLogoIcon,
  MonitorIcon,
  TerminalWindowIcon,
  UserCircleIcon,
  WindowsLogoIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import type { ComponentType } from "react";
import { useShallow } from "zustand/react/shallow";

import { AgentAvatar } from "@/components/AgentAvatar";
import { AGENT_NAME_LINK_CLASS, AgentTypeAvatar, AgentVersion } from "@/components/AgentIdentity";
import { PersonAvatar } from "@/components/PersonAvatar";
import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getMachine } from "../../apis/machines-table-apis";
import type { MachineRecordDto } from "../../dtos/machine-record.dto";
import { MachineFlowVersionRowActions } from "./MachineFlowVersionRowActions";

const STATUS_TONES: Record<MachineStatusEnum, RecordTone> = {
  [MachineStatusEnum.Online]: "ok",
  [MachineStatusEnum.Running]: "live",
  [MachineStatusEnum.Idle]: "neutral",
  [MachineStatusEnum.Offline]: "neutral",
  [MachineStatusEnum.Stopped]: "bad",
};

const OS_ICONS: Record<OsTypesEnum, ComponentType<IconProps>> = {
  [OsTypesEnum.Windows]: WindowsLogoIcon,
  [OsTypesEnum.Linux]: LinuxLogoIcon,
};

type MachineViewProps = {
  rowId: string;
};

/**
 * Read-only machine record: connection status, host facts, identifiers and assigned agents.
 */
export const MachineView = ({ rowId }: MachineViewProps) => {
  // Get the currently selected space so the query refetches when the space changes
  // (query key includes the space id — without it the cached agents list from the
  // previous space is served after a space switch).
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  const { data: response, isLoading } = useQuery({
    queryKey: ["machine", rowId, currentSpace?.id ?? ""],
    queryFn: () => getMachine(rowId),
    enabled: !!rowId,
  });

  const machine = response?.data as MachineRecordDto | undefined;
  useCrudDialogRecordView(machine?.name);

  if (isLoading) return <RecordSheetLoading label="Loading machine details..." />;
  if (!machine) return <RecordSheetUnavailable Icon={MonitorIcon} recordLabel="Machine" />;

  const agents = machine.machineFlowVersions ?? [];
  const OsIcon = OS_ICONS[machine.operatingSystem] ?? DesktopIcon;
  const lastCheckedIn = formatDate(machine.lastCheckedIn, true);
  const hasCheckedIn = lastCheckedIn !== FALLBACK_VALUE;

  return (
    <RecordSheet>
      <RecordSummary>
        <RecordStatusHero
          Icon={OsIcon}
          tone={STATUS_TONES[machine.status] ?? "neutral"}
          title={machine.status}
          description={
            hasCheckedIn
              ? `Last checked in ${formatDistanceToNow(new Date(machine.lastCheckedIn), { addSuffix: true })}`
              : "Never checked in"
          }
          detail={hasCheckedIn && lastCheckedIn}
          isMuted={machine.isDisabled}
          aside={
            machine.isDisabled ? (
              <Badge variant="destructive">Disabled</Badge>
            ) : (
              <Badge variant="outline" className="border-ok/35 text-ok">
                Enabled
              </Badge>
            )
          }
        />
        <RecordFactGrid>
          <RecordFact Icon={DesktopIcon} label="Hostname" value={machine.hostname} />
          <RecordFact Icon={TerminalWindowIcon} label="Username" value={machine.username} />
          <RecordFact Icon={OsIcon} label="Operating system" value={machine.operatingSystem} />
          <RecordFact
            Icon={UserCircleIcon}
            label="Linked account"
            value={machine.linkedUserAccount}
            prefix={<PersonAvatar name={machine.linkedUserAccount} className="size-5 text-[9px]" />}
          />
        </RecordFactGrid>
        <RecordIdentifiers>
          <RecordIdentifier label="Machine ID" value={machine.id} />
          <RecordIdentifier label="OS unique ID" value={machine.osID} />
        </RecordIdentifiers>
      </RecordSummary>

      <RecordSection title="Agents" count={agents.length}>
        {agents.length > 0 ? (
          <RecordList>
            {agents.map((flowVersion) => (
              <RecordListItem
                key={flowVersion.value}
                className="text-body-sm transition-colors duration-[120ms] ease-out hover:bg-hover"
              >
                <AgentTypeAvatar type={flowVersion.flowType} />
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <a
                    href={`${import.meta.env.VITE_STUDIO_PATH}agent?f=${flowVersion.flowId}&v=${flowVersion.value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    draggable={false}
                    title={`View ${flowVersion.flowName ?? flowVersion.label} v${flowVersion.versionNumber} in Agent Builder`}
                    className={cn(AGENT_NAME_LINK_CLASS, "text-ink")}
                  >
                    {flowVersion.flowName ?? flowVersion.label}
                  </a>
                  <AgentVersion
                    versionNumber={flowVersion.versionNumber}
                    lastModifiedOn={flowVersion.lastModifiedOn}
                  />
                </div>
                {flowVersion.flowId && machine.id && (
                  <MachineFlowVersionRowActions
                    machineId={machine.id}
                    machineName={machine.name}
                    flowId={flowVersion.flowId}
                    flowVersionId={flowVersion.value}
                    flowVersionLabel={flowVersion.label}
                    flowVersionPlatform={flowVersion.supportedPlatform}
                  />
                )}
              </RecordListItem>
            ))}
          </RecordList>
        ) : (
          <RecordEmpty mark={<AgentAvatar size="md" />}>
            No agents assigned to this machine
          </RecordEmpty>
        )}
      </RecordSection>
    </RecordSheet>
  );
};
