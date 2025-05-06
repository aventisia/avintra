import { useEffect, useState } from "react";

import { DataTableSkeleton, DTHeading } from "@aventisia/ui/data-table";
import { useDocumentTitle } from "@aventisia/ui/hooks";

import { TABLE_HEADING } from "../../constants";
import { useFetchQueuesWorkItems } from "../../hooks/useFetchQueuesWorkItems";
import { DynacmicDataTable } from "./DynacmicDataTable";

/**
 * Renders a table of queues.
 *
 * @returns The rendered QueuesWorkItemsTable component.
 */
export const WorkItemPayloadDataTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  const [data, setdata] = useState<object[]>();

  const { isLoading, data: reaspose } = useFetchQueuesWorkItems();

  useEffect(() => {
    if (reaspose?.data?.payloadData) {
      const jsonData: Record<string, string>[] = JSON.parse(
        reaspose?.data?.payloadData,
      );
      setdata(jsonData);
    }
  }, [reaspose?.data]);

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <DTHeading heading={TABLE_HEADING} />
          </div>

          <DynacmicDataTable data={data} isLoading={isLoading} />
        </div>
      ) : (
        // Show data table skeleton while fetching the queues data
        <DataTableSkeleton />
      )}
    </>
  );
};
