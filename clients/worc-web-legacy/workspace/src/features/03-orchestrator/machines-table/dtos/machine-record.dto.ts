import type { FlowVersionSearchResultDto } from "@/features/search-by-query/dtos/flow-version-search-result.dto";
import type { EnvironmentTypesEnum } from "@/react-toolkit/enums/environment-types-enum";
import type { MachineStatusEnum } from "@/react-toolkit/enums/machine-status-enum";
import type { OsTypesEnum } from "@/react-toolkit/enums/os-types-enum";

/**
 * Represents the full machine record returned by the get-by-id API.
 */
export interface MachineRecordDto {
  id: string;
  name: string;
  environment: EnvironmentTypesEnum;
  operatingSystem: OsTypesEnum;
  osID: string;
  username: string;
  hostname: string;
  ipAddress?: string;
  lastCheckedIn: string;
  status: MachineStatusEnum;
  machineFlowVersions: MachineFlowVersionDto[];
  isDisabled: boolean;
  createdBy: string;
  createdOn: Date;
  lastModifiedBy: string;
  lastModifiedOn: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface MachineFlowVersionDto extends FlowVersionSearchResultDto {
  // This interface inherits from FlowVersionSearchResultDto to include all properties of a flow version search result.
  // Additional properties specific to the machine-flow version relationship can be added here if needed in the future.
}
