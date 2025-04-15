import { useShallow } from "zustand/react/shallow";

import { useFetchTenants } from "@/features/sa/tenants-table/hooks/useFetchTenants";
import { DefaultTenantsEnum } from "@/react-toolkit/enums/default-tenants-enum";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { PricingPlanDto } from "@/react-toolkit/types/pricing-plan-dto";
import { currencyFormater } from "@/react-toolkit/utils/currency-formatter";
import { useQueryClient } from "@tanstack/react-query";

import { DATA_QUERY_KEY } from "../../constants";
import { LicensesTableDto } from "../../dtos/sa-licenses-table-dto";
import { OverviewDetailDivElement } from "./RecordPaymentOverviewDetails";

export const RequestLicenseOverviewDetails = ({
  planId,
  tenantId,
  licenseDetails,
  isFetching,
}: {
  planId: string;
  tenantId: string;
  isFetching: boolean;
  licenseDetails?: PricingPlanDto;
}) => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get query client
  const queryClient = useQueryClient();

  const { data: tenants } = useFetchTenants();

  // Get licenses data from query client
  const licensesData = queryClient.getQueryData<{
    data: LicensesTableDto[];
  }>(DATA_QUERY_KEY);

  // Get license data by id
  const oldTenant = licensesData?.data.find((item) => item.planId === planId);

  const newTenant = tenants?.data.find((item) => item.id === tenantId);

  return (
    <div>
      <p className="text-md mb-2 border-b-2 pb-2">Overview</p>
      <div className="mt-4 flex flex-col gap-2 text-sm font-light">
        <OverviewDetailDivElement
          label="Account Type :"
          isFetching={isFetching}
          data={
            userSession?.tenantName === DefaultTenantsEnum.IndividualUsers
              ? DefaultTenantsEnum.IndividualUsers
              : oldTenant?.tenantType
          }
        />
        <OverviewDetailDivElement
          label="Tenat Name :"
          isFetching={isFetching}
          data={oldTenant?.tenantName ?? newTenant?.name}
        />
        <OverviewDetailDivElement
          label="Unit Cost :"
          isFetching={isFetching}
          data={`${currencyFormater(licenseDetails?.unitPrice ?? 0, licenseDetails?.currency)} /mo`}
        />
        {licenseDetails?.frequency && licenseDetails?.frequency != "NA" ? (
          <OverviewDetailDivElement
            label="Billed :"
            isFetching={isFetching}
            data={licenseDetails?.frequency}
          />
        ) : null}
        <OverviewDetailDivElement
          label="Current Allocated Units :"
          isFetching={isFetching}
          data={oldTenant?.allocated ?? 0}
        />
      </div>
    </div>
  );
};
