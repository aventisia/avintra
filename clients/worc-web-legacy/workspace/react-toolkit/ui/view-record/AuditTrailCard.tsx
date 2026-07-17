import { Separator } from "@aventisia/ui";
import { formatDate } from "@aventisia/ui/utils";
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
      title="Audit Trail"
      icon={<Clock3Icon className="size-3.5 text-muted-foreground" />}
    >
      <ViewInfoRow label="Added By" value={createdBy} />
      <Separator className="h-[0.5px]" />
      <ViewInfoRow label="Added On" value={formatDate(createdOn, true)} />
      <Separator className="h-[0.5px]" />
      <ViewInfoRow label="Last Modified By" value={lastModifiedBy} />
      <Separator className="h-[0.5px]" />
      <ViewInfoRow label="Last Modified On" value={formatDate(lastModifiedOn, true)} />
    </ViewInfoRowsCard>
  );
};
