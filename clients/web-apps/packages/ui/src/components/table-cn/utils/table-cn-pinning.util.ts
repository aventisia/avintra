import { type Column } from "@tanstack/react-table";
import { type CSSProperties } from "react";

/**
 * Inline position and width for a header or body cell; pinned columns stick to their edge.
 * Widths apply only to columns that set an explicit `size`, so the rest keep auto layout.
 */
export const getTableCNCellStyle = <TData>(column: Column<TData, unknown>): CSSProperties => {
  const pinned = column.getIsPinned();
  const hasExplicitSize = column.columnDef.size !== undefined;

  return {
    position: pinned ? "sticky" : undefined,
    left: pinned === "left" ? column.getStart("left") : undefined,
    right: pinned === "right" ? column.getAfter("right") : undefined,
    width: hasExplicitSize ? column.getSize() : undefined,
    minWidth: hasExplicitSize ? column.getSize() : undefined,
  };
};

/**
 * Stacking and opaque background that keep pinned cells above scrolled content. Body cells
 * inherit the row background, so hover and selection colors reach them.
 */
export const getTableCNPinnedCellClassName = <TData>(
  column: Column<TData, unknown>,
  section: "header" | "body",
) => {
  if (!column.getIsPinned()) return undefined;
  return section === "header" ? "z-30" : "z-20 bg-inherit";
};
