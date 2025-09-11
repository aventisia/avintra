import { Alert } from "@/react-toolkit/ui/alert";
import { CheckCircle2Icon, ClockIcon, XCircleIcon } from "lucide-react";
import { StatusType } from "../dto/save-as-template";

interface StatusAlertProps {
  status?: StatusType;
  content?: string;
}

export const StatusAlert: React.FC<StatusAlertProps> = ({
  status,
  content,
}) => {
  switch (status) {
    case "Approved":
      return (
        <Alert
          variant="success"
          icon={CheckCircle2Icon}
          title="Approved"
          description={content ?? "The template has been approved by."}
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
            content ??
            "The template was not approved. You may revise and resubmit it for review."
          }
        />
      );

    default:
      return null;
  }
};
