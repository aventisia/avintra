import { useShallow } from 'zustand/react/shallow';

import { useFetchTenants } from '@/features/sa/tenants-table/hooks/useFetchTenants';
import { DefaultTenantsEnum } from '@/react-toolkit/enums/default-tenants-enum';
import { useFetchLicenseDetails } from '@/react-toolkit/hooks/useFetchLicense';
import { useUserSessionStore } from '@/react-toolkit/stores/user-session-store';
import { useQueryClient } from '@tanstack/react-query';

import { DATA_QUERY_KEY } from '../../constants';
import { LicensesTableDto } from '../../dtos/sa-licenses-table-dto';
import { OverviewDetailDivElement } from './RecordPaymentOverviewDetails';

export const RequestLicenseOverviewDetails = ({
  planId,
  tenantId,
}: {
  planId: string;
  tenantId: string;
}) => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get query client
  const queryClient = useQueryClient();

  const { data, isFetching } = useFetchLicenseDetails(planId);
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
          data={data?.data?.unitPrice}
        />
        <OverviewDetailDivElement
          label="Billed :"
          isFetching={isFetching}
          data={data?.data.frequency}
        />
        <OverviewDetailDivElement
          label="Current Allocated Units :"
          isFetching={isFetching}
          data={oldTenant?.overdueBalance}
        />
      </div>
    </div>
  );
};
