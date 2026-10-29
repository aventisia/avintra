import { Separator } from "@avplatform/ui";
import { formatDate } from "@avplatform/ui/utils";
import { Clock3Icon } from "lucide-react";

import { ViewInfoRow } from "./ViewInfoRow";
import { ViewInfoRowsCard } from "./ViewInfoRowsCard";

type AuditTrailCardProps = {
  createdBy?: string;
  createdOn?: Date;
  lastModifiedBy?: string;
  lastModifiedOn?: Date;
};

/**
 * Renders an audit trail card displaying creation and last modification details.
 */
export const AuditTrailCard = ({
  createdBy,
  createdOn,
  lastModifiedBy,
  lastModifiedOn,
}: AuditTrailCardProps) => {
  return (
    <ViewInfoRowsCard
      title="Audit trail"
      icon={<Clock3Icon className="size-3.5 text-muted-foreground" />}
    >
      <ViewInfoRow label="Added by" value={createdBy} />
      <Separator />
      <ViewInfoRow label="Added on" value={formatDate(createdOn, true)} />
      <Separator />
      <ViewInfoRow label="Last modified by" value={lastModifiedBy} />
      <Separator />
      <ViewInfoRow label="Last modified on" value={formatDate(lastModifiedOn, true)} />
    </ViewInfoRowsCard>
  );
};
