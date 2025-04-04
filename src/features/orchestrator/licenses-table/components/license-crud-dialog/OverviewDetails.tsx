import { useFetchLicenseDetails } from "@/react-toolkit/hooks/useFetchLicense";
import { MyLicensesTableDto } from "../../dtos/licenses-table-dto";
import { DATA_QUERY_KEY } from "../../constants";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/react-toolkit/ui/skeleton";

export const OverviewDetails = ({ planId }: { planId: string }) => {
  // Get query client
  const queryClient = useQueryClient();
  const { data, isFetching } = useFetchLicenseDetails(planId);
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
        <div className="flex justify-between">
          <p>Unit Cost:</p>
          <div className="font-medium">
            {isFetching ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              data?.data.unitPrice
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <p>Billed:</p>
          <div className="font-medium">
            {isFetching ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              data?.data.frequency
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <p>Current Allocated Units:</p>
          <p className="font-medium">{myLicenseData?.allocated ?? 0}</p>
        </div>
      </div>
    </div>
  );
};
