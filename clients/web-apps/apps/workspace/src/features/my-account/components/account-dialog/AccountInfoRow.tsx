import type { ReactNode } from "react";

/**
 * Read-only label and value shown in a tinted row, for details the user can't edit here.
 */
export const AccountInfoRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="rounded-md bg-sunken/80 px-3.5 py-2.5 ring-1 ring-line">
    <p className="text-[12px] text-muted-foreground">{label}</p>
    <p className="truncate text-[13px] font-semibold text-ink">{value}</p>
  </div>
);
