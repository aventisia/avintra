import { UpgradeCreateButton } from "@avplatform/ui";
import { CrudCreateButton } from "@avplatform/ui/crud-dialog";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import {
  TableCN,
  TableCNHeading,
  TableCNSkeleton,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";

import {
  DATA_QUERY_KEY,
  SPACES_INITIAL_STATE,
  SPACES_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants";
import { useFetchSpaces } from "../hooks/useFetchSpaces";
import { getSpacesTableColumns } from "./SpacesTableColumns";

const MARKETING_URL = import.meta.env.VITE_MARKETING_URL;
const UPGRADE_PRICING_URL = `${MARKETING_URL ?? "https://aventisia.com"}/pricing`;

const PAGINATION_PROPS = { pageSizeOptions: SPACES_PAGE_SIZE_OPTIONS };

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

  // Fetch spaces data
  const { data } = useFetchSpaces();

  // Build the table columns, omitting row actions for the read-only community space
  const columns = useMemo(
    () => getSpacesTableColumns(!isCommunityDeployment),
    [isCommunityDeployment],
  );

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns,
    initialState: SPACES_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
  });

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Page heading and create action */}
          <div className="flex items-center justify-between">
            <div className="flex w-max flex-col gap-0.5">
              <div className="flex w-max items-center gap-2">
                <TableCNHeading heading={TABLE_HEADING} />
              </div>
              <p className="ml-1 max-w-md text-sm text-muted-foreground">
                A logical container that acts as a global filtering / scoping dimension across the
                platform.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isLimitedPlan ? (
                useTenantOverview ? (
                  <UpgradeCreateButton label="Create Space" upgradePath="/tenant/overview" />
                ) : (
                  <UpgradeCreateButton label="Create Space" pricingUrl={UPGRADE_PRICING_URL} />
                )
              ) : (
                <CrudCreateButton buttonText="Create space" entity="space" />
              )}
            </div>
          </div>

          {/* Table with its toolbar and pagination footer */}
          <TableCN table={table} label={TABLE_HEADING} paginationProps={PAGINATION_PROPS}>
            <TableCNToolbar table={table} searchPlaceholder="Search spaces..." />
          </TableCN>

          {/* Resource Share Dialog component */}
          <ResourceUserAccessDialog queryKey={DATA_QUERY_KEY} />
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the spaces data
        <TableCNSkeleton columnCount={7} />
      )}
    </>
  );
};
