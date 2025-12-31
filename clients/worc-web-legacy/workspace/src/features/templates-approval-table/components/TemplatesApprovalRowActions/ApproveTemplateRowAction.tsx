import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { CheckIcon } from "lucide-react";

import { useFetchTemplateDetails } from "../../hooks/useFetchTemplateDetails";
import { useUpdateTemplateMutation } from "../../hooks/useUpdateTemplateMutation";

const ApproveTemplateRowAction = ({ rowId }: { rowId: string }) => {
  const { data } = useFetchTemplateDetails(rowId);

  const { mutate } = useUpdateTemplateMutation();

  return (
    <SimpleDDMenuItem
      content="Approve"
      Icon={CheckIcon}
      onClick={() => {
        if (data?.data) mutate({ ...data?.data, status: "Approved" });
      }}
    />
  );
};

export default ApproveTemplateRowAction;
