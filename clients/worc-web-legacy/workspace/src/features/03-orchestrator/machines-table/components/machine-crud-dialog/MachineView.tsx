import { CopyableText, LoadingSpinner, NoContentMessage, Separator } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";
import { FALLBACK_VALUE } from "@aventisia/ui/constants";
import { cn } from "@aventisia/ui/lib";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { formatDate, maskIP } from "@aventisia/ui/utils";
import { useQuery } from "@tanstack/react-query";
import {
  BanIcon,
  CheckCircleIcon,
  HardDriveIcon,
  MonitorCogIcon,
  MonitorIcon,
  NetworkIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import NewAgentIcon from "@/components/NewAgentIcon";
import {
  AuditTrailCard,
  ViewBadge,
  ViewContainer,
  ViewField,
  ViewFieldWithCopy,
  ViewInfoRow,
  ViewInfoRowsCard,
} from "@/react-toolkit/ui/view-record";
import { ViewDefaultCard } from "@/react-toolkit/ui/view-record/ViewDefaultCard";

import { getMachine } from "../../apis/machines-table-apis";
import { statusColor } from "../../constants/column-display-names";
import type { MachineRecordDto } from "../../dtos/machine-record.dto";
import { MachineFlowVersionRowActions } from "./MachineFlowVersionRowActions";

/**
 * MachineView component displays the details of a machine in a read-only view.
 * It fetches the machine data from the API using the rowId from the crud dialog store.
 * If the machine data is not found, it displays a message indicating that the record is not available.
 * Otherwise, it renders the machine details including profile, environment, OS type, connection status,
 * assigned flow versions/agents with their metadata, and audit trail.
 * The component uses various UI components such as CopyableText, Badge, and ViewInfoRowsCard to present the information in a structured manner.
 *
 * @returns {JSX.Element} The rendered MachineView component.
 */
export const MachineView = () => {
  // Get the rowId from the crud dialog store
  const {
    crudDialogOptions: { rowId },
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
    })),
  );

  // Fetch the machine data from the API
  const { data: response, isLoading } = useQuery({
    queryKey: ["machine", rowId],
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
        <NoContentMessage
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
          <p className="text-2xs uppercase tracking-wide text-muted-foreground">Machine Profile</p>
          <CopyableText
            title={`Machine Name: ${machine.name}`}
            textClassName="truncate max-w-[24rem] text-base font-medium leading-tight"
            value={machine.name}
            ariaLabel="copy machine name"
          />
          <CopyableText
            className="mt-0.5 w-full"
            textClassName="font-mono max-w-[24rem] text-sm font-medium text-muted-foreground"
            value={machine.id ?? FALLBACK_VALUE}
            ariaLabel="copy machine id"
          />
        </div>

        {/* Env, OS Type, and Disabled status section */}
        <div className="flex flex-wrap items-center gap-2.5">
          <ViewBadge Icon={HardDriveIcon} text={machine.environment} />
          <ViewBadge Icon={MonitorCogIcon} text={machine.operatingSystem} />
          {machine.isDisabled ? (
            <ViewBadge Icon={BanIcon} text="Disabled" viewStyle="disabled" />
          ) : (
            <ViewBadge Icon={CheckCircleIcon} text="Enabled" viewStyle="enabled" />
          )}
        </div>

        {/* OS Unique Id, Hostname, Username, and IP Address section */}
        <div className="grid grid-cols-2 gap-2">
          <ViewFieldWithCopy textClassName="font-mono" label="OS Unique Id" value={machine.osID} />
          <ViewField label="Hostname" value={machine.hostname} />
          <ViewField label="Username" value={machine.username} />
          <ViewField label="IP Address" value={maskIP(machine.ipAddress)} />
        </div>
      </ViewDefaultCard>

      {/* Agents section */}
      <ViewInfoRowsCard
        title="Agents"
        className="border-primary-100"
        icon={<NewAgentIcon className="size-3.5 text-primary" />}
      >
        {machine.machineFlowVersions && machine.machineFlowVersions.length > 0 ? (
          <div className="flex flex-col gap-2.5 py-1">
            {machine.machineFlowVersions.map((flowVersion, index) => (
              <div key={flowVersion.flowVersionId} className="flex flex-col gap-1.5">
                {index > 0 && <Separator className="h-[0.5px]" />}
                <div className="flex flex-row gap-1.5 justify-between">
                  <NavLink
                    to={`${window.location.origin}${import.meta.env.VITE_STUDIO_PATH}agent?f=${flowVersion.flowId}&v=${flowVersion.flowVersionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`View ${flowVersion.flowName} v${flowVersion.versionNumber} in Agent Builder`}
                    className="group inline-flex h-auto w-auto text-sm cursor-pointer truncate font-normal text-foreground hover:text-primary"
                  >
                    <span className="inline-flex items-center gap-1 border-b-[0.1rem] border-transparent group-hover:border-primary">
                      <span className="truncate max-w-[20rem]">{flowVersion.flowName}</span>
                      <span className="bg-slate-100 border group-hover:text-primary text-2xs rounded-xl px-1.5 py-[1px] text-muted-foreground">
                        v{flowVersion.versionNumber}
                      </span>
                    </span>
                  </NavLink>
                  <MachineFlowVersionRowActions
                    machineId={machine.id}
                    flowId={flowVersion.flowId}
                    flowVersionId={flowVersion.flowVersionId}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ViewInfoRow label="Assigned Agents" value="No agents assigned" />
        )}
      </ViewInfoRowsCard>

      {/* Connection section */}
      <ViewInfoRowsCard
        title="Connection"
        icon={<NetworkIcon className="size-3.5 text-muted-foreground" />}
      >
        <ViewInfoRow
          label="Status"
          value={
            <Badge className={cn("font-mono", statusColor[machine.status])}>{machine.status}</Badge>
          }
        />
        <Separator className="h-[0.5px]" />
        <ViewInfoRow label="Last Checked In" value={formatDate(machine.lastCheckedIn, true)} />
      </ViewInfoRowsCard>

      <AuditTrailCard
        createdBy={machine.createdBy}
        createdOn={machine.createdOn}
        lastModifiedBy={machine.lastModifiedBy}
        lastModifiedOn={machine.lastModifiedOn}
      />
    </ViewContainer>
  );
};
