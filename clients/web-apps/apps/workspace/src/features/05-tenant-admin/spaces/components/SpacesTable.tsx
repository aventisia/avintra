import { UpgradeCreateButton } from "@avplatform/ui";
import {
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { HelpButton } from "@/components/help/HelpButton";
import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";

import { DATA_QUERY_KEY, TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchSpaces } from "../hooks/useFetchSpaces";
import { getSpacesTableColumns } from "./SpacesTableColumns";

const MARKETING_URL = import.meta.env.VITE_MARKETING_URL;
const UPGRADE_PRICING_URL = `${MARKETING_URL ?? "https://aventisia.com"}/pricing`;

/**
 * Renders a table of spaces.
 *
 * @returns The rendered SpacesTable component.
 */
export const SpacesTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get the deployment type and plan type to gate space creation
  const { deploymentType, planType } = useUserSessionStore(
    useShallow((state) => ({
      deploymentType: state.userSession?.deploymentType,
      planType: state.userSession?.planType,
    })),
  );

  // Community deployments and Starter plans are limited to the single Central space
  const isCommunityDeployment = deploymentType === "Community";
  const isLimitedPlan = isCommunityDeployment || planType === "Starter";
  const useTenantOverview = planType === "Starter" && !isCommunityDeployment;

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Fetch spaces data
  const { data } = useFetchSpaces();

  // Build the table columns, omitting row actions for the read-only community space
  const columns = useMemo(
    () => getSpacesTableColumns(!isCommunityDeployment),
    [isCommunityDeployment],
  );

  // Create a React table for spaces data
  const table = useDataTable(columns, data?.data || [], columnVisibility, sortState, true);

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex w-max flex-col gap-0.5">
              <div className="flex w-max items-center gap-2">
                <DTHeading heading={TABLE_HEADING} />
                <HelpButton guideId="spaces" />
              </div>
              <p className="ml-1 max-w-md text-sm text-muted-foreground">
                A logical container that acts as a global filtering / scoping dimension across the
                platform.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search spaces..." />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              {isLimitedPlan ? (
                useTenantOverview ? (
                  <UpgradeCreateButton label="Create Space" upgradePath="/tenant/overview" />
                ) : (
                  <UpgradeCreateButton label="Create Space" pricingUrl={UPGRADE_PRICING_URL} />
                )
              ) : (
                <DTCreateButton buttonText="Create Space" entity="space" />
              )}
            </div>
          </div>

          {/* Data table to render data */}
          <DataTable table={table} columnsLength={columns.length} />
          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Resource Share Dialog component */}
          <ResourceUserAccessDialog queryKey={DATA_QUERY_KEY} />
        </div>
      ) : (
        // Show data table skeleton while fetching the spaces data
        <DataTableSkeleton />
      )}
    </>
  );
};
