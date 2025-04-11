import {
  OverviewDetailDivElement
} from '@/features/sa/sa-licenses-table/components/sa-license-crud-dialog/RecordPaymentOverviewDetails'
import { currencyFormater } from '@/react-toolkit/constants'
import { PricingPlanDto } from '@/react-toolkit/types/pricing-plan-dto'
import { useQueryClient } from '@tanstack/react-query'

import { DATA_QUERY_KEY } from '../../constants'
import { MyLicensesTableDto } from '../../dtos/licenses-table-dto'

export const OverviewDetails = ({
  planId,
  licenseDetails,
  isFetching,
}: {
  planId: string;
  isFetching: boolean;
  licenseDetails?: PricingPlanDto;
}) => {
  // Get query client
  const queryClient = useQueryClient();
  // Get licenses data from query client
  const licensesData = queryClient.getQueryData<{
    data: MyLicensesTableDto[];
  }>(DATA_QUERY_KEY);

  // Get license data by id
  const myLicenseData = licensesData?.data.find(
    (item) => item.planId === planId,
  );

  return (
    <div>
      <p className="text-md mb-2 border-b-2 pb-2">Overview</p>
      <div className="mt-4 flex flex-col gap-2 text-sm font-light">
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
          data={myLicenseData?.allocated ?? 0}
        />
      </div>
    </div>
  );
};
