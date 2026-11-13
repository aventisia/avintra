import { CheckCircleIcon, ClockIcon, XCircleIcon } from "@phosphor-icons/react";

import { StatusType } from "../dto/save-as-template";
import { TemplateNotice } from "./TemplateNotice";

interface StatusAlertProps {
  status?: StatusType;
  remark?: string;
  approvedBy?: string;
}

export const StatusAlert: React.FC<StatusAlertProps> = ({ status, remark, approvedBy }) => {
  switch (status) {
    case "Approved":
      return (
        <TemplateNotice tone="ok" Icon={CheckCircleIcon} title="Approved">
          The template has been approved by {approvedBy}
        </TemplateNotice>
      );

    case "Pending":
      return (
        <TemplateNotice tone="warn" Icon={ClockIcon} title="Pending">
          The template is currently under review.
        </TemplateNotice>
      );

    case "Rejected":
      return (
        <TemplateNotice tone="bad" Icon={XCircleIcon} title="Rejected">
          {remark ?? "The template was not approved. You may revise and resubmit it for review."}
        </TemplateNotice>
      );

    default:
      return null;
  }
};
