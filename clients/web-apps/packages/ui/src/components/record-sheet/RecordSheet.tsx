import type { ComponentType, ReactNode } from "react";

import { EmptyState } from "@/ui/components/EmptyState";
import { LoadingSpinner } from "@/ui/components/LoadingSpinner";
import { type IconProps } from "@/ui/types";

/**
 * Body of a read-only record dialog: a summary card followed by sections.
 */
export const RecordSheet = ({ children }: { children: ReactNode }) => (
  <div className="space-y-6 pb-1">{children}</div>
);

export const RecordSheetLoading = ({ label }: { label: string }) => (
  <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
    <LoadingSpinner className="size-8 text-primary" />
    {label}
  </div>
);

type RecordSheetUnavailableProps = {
  Icon: ComponentType<IconProps>;
  /** Record type in sentence case, for example "Machine". */
  recordLabel: string;
};

export const RecordSheetUnavailable = ({ Icon, recordLabel }: RecordSheetUnavailableProps) => (
  <div className="flex min-h-64 items-center justify-center">
    <EmptyState
      Icon={Icon}
      primaryMessage={`${recordLabel} record is not available.`}
      secondaryMessage="Try refreshing the page and opening this record again."
    />
  </div>
);
