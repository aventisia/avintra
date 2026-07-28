import { Alert } from "@avplatform/ui/alert";
import { CheckCircle2Icon, ClockIcon, XCircleIcon } from "lucide-react";
import { StatusType } from "../dto/prompt-template-dto";

interface StatusAlertProps {
  status?: StatusType;
  remark?: string;
  approvedBy?: string;
}

export const StatusAlert: React.FC<StatusAlertProps> = ({
  status,
  remark,
  approvedBy,
}) => {
  switch (status) {
    case "Approved":
      return (
        <Alert
          variant="success"
          icon={CheckCircle2Icon}
          title="Approved"
          description={`The template has been approved by ${approvedBy}`}
        />
      );

    case "Pending":
      return (
        <Alert
          variant="warning"
          icon={ClockIcon}
          title="Pending"
          description="The template is currently under review."
        />
      );

    case "Rejected":
      return (
        <Alert
          variant="destructive"
          icon={XCircleIcon}
          title="Rejected"
          description={
            remark ??
            "The template was not approved. You may revise and resubmit it for review."
          }
        />
      );

    default:
      return null;
  }
};
