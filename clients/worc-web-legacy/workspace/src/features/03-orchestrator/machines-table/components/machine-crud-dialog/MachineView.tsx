import { CopyableText, NoContentMessage, Separator } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";
import { FALLBACK_VALUE } from "@aventisia/ui/constants";
import { cn } from "@aventisia/ui/lib";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { formatDate, maskIP } from "@aventisia/ui/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  BanIcon,
  CheckCircleIcon,
  HardDriveIcon,
  MonitorCogIcon,
  MonitorIcon,
  NetworkIcon,
  ServerIcon,
} from "lucide-react";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

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

import { DATA_QUERY_KEY } from "../../constants";
import { statusColor } from "../../constants/column-display-names";
import type { MachinesTableRowDto } from "../../dtos/machines-table-row-dto";

/**
 * MachineView component displays the details of a machine in a read-only view.
 * It fetches the machine data from the query cache using the rowId from the crud dialog store.
 * If the machine data is not found, it displays a message indicating that the record is not available.
 * Otherwise, it renders the machine details including profile, environment, OS type, connection status, and audit trail.
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

  // Get the query client to access the cached data
  const queryClient = useQueryClient();

  // Fetch the machine data from the cached query data using the rowId
  const machine = useMemo(() => {
    const queryData = queryClient.getQueryData<{ data: MachinesTableRowDto[] }>(DATA_QUERY_KEY);

    return queryData?.data.find((item) => item.id === rowId);
  }, [queryClient, rowId]);

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
            textClassName="font-mono text-sm font-medium text-muted-foreground"
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
          <ViewFieldWithCopy label="OS Unique Id" value={machine.osID} />
          <ViewField label="Hostname" value={machine.hostname} />
          <ViewField label="Username" value={machine.username} />
          <ViewField label="IP Address" value={maskIP(machine.ipAddress)} />
        </div>
      </ViewDefaultCard>

      {/* Runtime section */}
      <ViewInfoRowsCard
        title="Runtime"
        icon={<ServerIcon className="size-3.5 text-muted-foreground" />}
      >
        <ViewInfoRow label="Assigned Agents" value={machine.flowVersionCount} />
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
        {machine.connectionId && (
          <>
            <Separator className="h-[0.5px]" />
            <ViewInfoRow label="Connection ID" value={machine.connectionId} mono={true} />
          </>
        )}
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
