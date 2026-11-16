import { AgentsTableDto } from "../dtos/agents-table-dto";
import { PublishedUiDto } from "../dtos/published-ui-dto";

/**
 * Maps published UI builder projects to agent table rows so both share the Published table.
 */
export const mapPublishedUisToAgentRows = (uis: PublishedUiDto[]): AgentsTableDto[] =>
  uis.map((ui) => ({
    id: ui.id,
    refId: ui.id,
    type: "UI",
    name: ui.name,
    licenseId: null,
    isActive: false,
    isLocked: false,
    isDraft: false,
    isPublished: true,
    isAssignedToAllUsers: ui.isPublishedTenantWide,
    isArchived: false,
    isDisabled: ui.isDisabled,
    createdBy: ui.createdBy ?? null,
    createdByUsername: null,
    createdOn: ui.createdOn ?? new Date(0),
    createdByUserInitials: null,
    versionNumber: ui.publishedVersionNumber ?? 0,
    machineCount: undefined,
    supportedPlatform: undefined,
  }));
