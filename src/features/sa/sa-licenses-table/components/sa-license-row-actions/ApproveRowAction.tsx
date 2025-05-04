import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";
import { useQueryClient } from "@tanstack/react-query";
import Enumerable from "linq";
import { BiCheckDouble } from "react-icons/bi";

import { saLicenseOptimisticMutationFn } from "../../apis/sa-licenses-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { LicensesTableDto } from "../../dtos/sa-licenses-table-dto";

export const ApproveRowAction = ({ rowId }: { rowId: string }) => {
  //get the query client
  const queryClient = useQueryClient();

  const queryData = queryClient.getQueryData<{ data: LicensesTableDto[] }>(
    DATA_QUERY_KEY,
  );
  const data = Enumerable.from(
    queryData?.data as LicensesTableDto[],
  )?.firstOrDefault((x) => x.id === rowId);

  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the keystore
  const { mutate: approve } = useListOptimisticMutation<
    LicensesTableDto,
    LicensesTableDto | boolean,
    LicensesTableDto
  >([rowId], saLicenseOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <SimpleDDMenuItem
      content="Approve Allocation"
      Icon={BiCheckDouble}
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () =>
            approve({
              payload: data as LicensesTableDto,
              crudAction: "update",
            }),
          isDestructive: false,
          title: "Approve the Request?",
          description: `Are you sure to approve, ${data?.additionalUnitsRequested} requested for ${data?.unit} unit having price ${data?.unitPrice} from ${data?.tenantName}`,
          confirmBtnText: "Approve",
        });
      }}
    />
  );
};
