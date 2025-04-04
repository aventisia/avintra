import { useFetchLicenseDetails } from "@/react-toolkit/hooks/useFetchLicense";
import { LicensesTableDto } from "../../dtos/sa-licenses-table-dto";
import { DATA_QUERY_KEY } from "../../constants";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/react-toolkit/ui/skeleton";

export const OverviewDetails = ({ planId }: { planId: string }) => {
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
          data={myLicenseData?.tenantName}
        />
        <OverviewDetailDivElement
          label="Unit Cost :"
          isFetching={isFetching}
          data={data?.data.unitPrice}
        />
        <OverviewDetailDivElement
          label="Billed :"
          isFetching={isFetching}
          data={data?.data.frequency}
        />
        <OverviewDetailDivElement
          label="Current Allocated Units :"
          isFetching={isFetching}
          data={myLicenseData?.allocated}
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
      {isFetching ? <Skeleton className="h-5 w-32" /> : data}
    </div>
  </div>
);
