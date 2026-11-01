/* eslint-disable @typescript-eslint/no-explicit-any */
import { TableCN } from "@avplatform/ui/table-cn";
import { Table } from "@tanstack/react-table";

const UPLOADED_ITEMS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const UPLOADED_ITEMS_ROW_LABELS = { singular: "item", plural: "items" };

const UploadedItemsDT = ({ table }: { table: Table<any> }) => (
  <div className="space-y-3">
    {/* IMPORTANT NOTE: Match the dialog's fixed width so the table fills it; TableCN's own
        ScrollArea shows a horizontal scrollbar when columns exceed it. */}
    <div className="max-w-[57rem]">
      <TableCN
        table={table}
        paginationProps={{
          pageSizeOptions: UPLOADED_ITEMS_PAGE_SIZE_OPTIONS,
          rowLabels: UPLOADED_ITEMS_ROW_LABELS,
        }}
      />
    </div>
  </div>
);

export default UploadedItemsDT;
