import { DataTableSkeleton, DTHeading } from "@aventisia/ui/data-table";
import { useDocumentTitle } from "@aventisia/ui/hooks";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { TABLE_HEADING } from "../../constants";
import { useFetchQueuesWorkItems } from "../../hooks/useFetchQueuesWorkItems";
import { usePayloadDataStore } from "../../store/payload-data-store";

import { DynacmicDataTable } from "./DynacmicDataTable";

/**
 * Renders a table of queues.
 *
 * @returns The rendered QueuesWorkItemsTable component.
 */
export const WorkItemPayloadDataTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  const { isLoading, data: reaspose } = useFetchQueuesWorkItems();

  const { payloadData, setPayloadData, currentWorkItem, setCurrentWorkItem } =
    usePayloadDataStore(
      useShallow((state) => ({
        payloadData: state.payloadData,
        currentWorkItem: state.currentWorkItem,
        setPayloadData: state.setPayloadData,
        setCurrentWorkItem: state.setCurrentWorkItem,
      })),
    );

  useEffect(() => {
    if (reaspose?.data?.payloadData) {
      setCurrentWorkItem(reaspose?.data);
      const jsonData: Record<string, string>[] = JSON.parse(
        reaspose?.data?.payloadData,
      );
      setPayloadData(jsonData);
    }
  }, [reaspose?.data, setCurrentWorkItem, setPayloadData]);

  // Return the rendered DataTable component.
  return (
    <>
      {payloadData ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <DTHeading
              heading={`Payload Data: ${currentWorkItem?.queueName ?? ""} `}
            />
          </div>

          <DynacmicDataTable data={payloadData} isLoading={isLoading} />
        </div>
      ) : (
        // Show data table skeleton while fetching the queues data
        <DataTableSkeleton />
      )}
    </>
  );
};
