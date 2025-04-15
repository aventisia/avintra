import { useFetchLicenseDetails } from "@/react-toolkit/hooks/useFetchLicense";
import { Skeleton } from "@/react-toolkit/ui/skeleton";
import { currencyFormater } from "@/react-toolkit/utils/currency-formatter";
import { useQueryClient } from "@tanstack/react-query";

import { DATA_QUERY_KEY } from "../../constants";
import { LicensesTableDto } from "../../dtos/sa-licenses-table-dto";

export const RecordPaymentOverviewDetails = ({
  planId,
}: {
  planId: string;
}) => {
  // Get query client
  const queryClient = useQueryClient();
  const { data, isFetching } = useFetchLicenseDetails(planId);
  // Get licenses data from query client
  const licensesData = queryClient.getQueryData<{
    data: LicensesTableDto[];
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
          label="Tenant Type :"
          isFetching={isFetching}
          data={myLicenseData?.tenantType}
        />
        <OverviewDetailDivElement
          label="Tenat Name :"
          isFetching={isFetching}
          data={myLicenseData?.tenantName ?? "Default"}
        />
        <OverviewDetailDivElement
          label="Pricing Component :"
          isFetching={isFetching}
          data={myLicenseData?.pricingComponent}
        />
        <OverviewDetailDivElement
          label="Currency :"
          isFetching={isFetching}
          data={data?.data.currency}
        />
        <OverviewDetailDivElement
          label="Overdue Amount :"
          isFetching={isFetching}
          data={currencyFormater(
            myLicenseData?.overdueBalance ?? 0,
            data?.data.currency,
          )}
        />
        <OverviewDetailDivElement
          label="Overdue Amount (in INR) :"
          isFetching={isFetching}
          data={currencyFormater(myLicenseData?.overdueBalance ?? 0, "INR")}
        />
      </div>
    </div>
  );
};

export const OverviewDetailDivElement = ({
  isFetching,
  data,
  label,
}: {
  isFetching: boolean;
  label: string;
  data: string | number | undefined;
}) => (
  <div className="flex justify-between">
    <p>{label}</p>
    <div className="font-medium">
      {isFetching ? <Skeleton className="h-5 w-32" /> : (data ?? "NA")}
    </div>
  </div>
);
