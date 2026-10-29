import { CopyableText, EmptyState, LoadingSpinner, Separator } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { FlowVersionNavLink } from "@avplatform/ui/components/FlowVersionNavLink";
import {
  ViewBadge,
  ViewContainer,
  ViewField,
  ViewFieldWithCopy,
  ViewInfoRow,
  ViewInfoRowsCard,
} from "@avplatform/ui/components/view-record";
import { ViewDefaultCard } from "@avplatform/ui/components/view-record/ViewDefaultCard";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { formatDate } from "@avplatform/ui/utils";
import { useQuery } from "@tanstack/react-query";
import { BanIcon, CheckCircleIcon, MonitorCogIcon, MonitorIcon, NetworkIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import NewAgentIcon from "@/components/NewAgentIcon";
import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getMachine } from "../../apis/machines-table-apis";
import { statusVariant } from "../../constants/column-display-names";
import type { MachineRecordDto } from "../../dtos/machine-record.dto";
import { MachineFlowVersionRowActions } from "./MachineFlowVersionRowActions";

/**
 * MachineView component displays the details of a machine in a read-only view.
 * It fetches the machine data from the API using the rowId from the crud dialog store.
 * If the machine data is not found, it displays a message indicating that the record is not available.
 * Otherwise, it renders the machine details including profile, OS type, connection status,
 * assigned flow versions/agents with their metadata, and audit trail.
 * The component uses various UI components such as CopyableText, Badge, and ViewInfoRowsCard to present the information in a structured manner.
 *
 * @returns {JSX.Element} The rendered MachineView component.
 */
interface MachineViewProps {
  rowId: string;
}

export const MachineView = ({ rowId }: MachineViewProps) => {
  // Get the currently selected space so the query refetches when the space changes
  // (query key includes the space id — without it the cached agents list from the
  // previous space is served after a space switch).
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  // Fetch the machine data from the API
  const { data: response, isLoading } = useQuery({
    queryKey: ["machine", rowId, currentSpace?.id ?? ""],
    queryFn: () => getMachine(rowId),
    enabled: !!rowId,
  });

  const machine = response?.data as MachineRecordDto | undefined;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col text-sm gap-3 items-center justify-center">
        <LoadingSpinner className="size-8 text-primary" />
        Loading machine details...
      </div>
    );
  }

  // If the machine data is not found, display a message indicating that the record is not available
  if (!machine) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <EmptyState
          className="-mt-20"
          Icon={MonitorIcon}
          primaryMessage="Machine record is not available."
          secondaryMessage="Try refreshing the page and opening this record again."
        />
      </div>
    );
  }

  // Render the machine details in a read-only view
  return (
    <ViewContainer>
      <ViewDefaultCard>
        {/* Machine profile section */}
        <div className="flex flex-col gap-1">
          <p className="text-2xs uppercase tracking-wide text-muted-foreground">Machine profile</p>
          <CopyableText
            title={`Machine Name: ${machine.name}`}
            textClassName="truncate max-w-[24rem] text-base font-medium leading-tight"
            value={machine.name}
          />
          <CopyableText
            className="mt-0.5 w-full"
            textClassName="font-mono max-w-[24rem] text-sm font-medium text-muted-foreground"
            value={machine.id ?? FALLBACK_VALUE}
          />
        </div>

        {/* OS Type and Disabled status section */}
        <div className="flex flex-wrap items-center gap-2.5">
          <ViewBadge Icon={MonitorCogIcon} text={machine.operatingSystem} />
          {machine.isDisabled ? (
            <ViewBadge Icon={BanIcon} text="Disabled" viewStyle="disabled" />
          ) : (
            <ViewBadge Icon={CheckCircleIcon} text="Enabled" viewStyle="enabled" />
          )}
        </div>

        {/* OS Unique Id, Hostname, Username, and User section */}
        <div className="grid grid-cols-2 gap-2">
          <ViewFieldWithCopy textClassName="font-mono" label="OS unique ID" value={machine.osID} />
          <ViewField label="Hostname" value={machine.hostname} />
          <ViewField label="Username" value={machine.username} />
          <ViewField label="Linked user account" value={machine.linkedUserAccount} />
        </div>
      </ViewDefaultCard>

      {/* Agents section */}
      <ViewInfoRowsCard
        title="Agents"
        className="border-line"
        icon={<NewAgentIcon className="size-3.5 text-primary" />}
      >
        {machine.machineFlowVersions && machine.machineFlowVersions.length > 0 ? (
          <div className="flex flex-col gap-2.5 py-1">
            {machine.machineFlowVersions.map((flowVersion, index) => (
              <div key={flowVersion.value} className="flex flex-col gap-1.5">
                {index > 0 && <Separator className="h-[0.5px]" />}
                <div className="flex flex-row items-center gap-1.5 justify-between">
                  <FlowVersionNavLink
                    to={`${import.meta.env.VITE_STUDIO_PATH}agent?f=${flowVersion.flowId}&v=${flowVersion.value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`View ${flowVersion.label} in Agent Builder`}
                    flowName={flowVersion.label}
                    flowVersionNumber={`v${flowVersion.versionNumber}`}
                  />
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ViewInfoRow label="Assigned agents" value="No agents assigned" />
        )}
      </ViewInfoRowsCard>

      {/* Connection section */}
      <ViewInfoRowsCard
        title="Connection"
        icon={<NetworkIcon className="size-3.5 text-muted-foreground" />}
      >
        <ViewInfoRow
          label="Status"
          value={<Badge variant={statusVariant[machine.status]}>{machine.status}</Badge>}
        />
        <Separator className="h-[0.5px]" />
        <ViewInfoRow label="Last checked in" value={formatDate(machine.lastCheckedIn, true)} />
      </ViewInfoRowsCard>
    </ViewContainer>
  );
};
