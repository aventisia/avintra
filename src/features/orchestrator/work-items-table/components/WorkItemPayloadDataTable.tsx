import { DataTableSkeleton, DTHeading } from "@aventisia/ui/data-table";
import { useDocumentTitle } from "@aventisia/ui/hooks";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { DynacmicDataTable } from "@/react-toolkit/ui/dynamic-data-table/DynacmicDataTable";

import { TABLE_HEADING } from "../constants";
import { useFetchQueuesWorkItems } from "../hooks/useFetchQueuesWorkItems";
import { usePayloadDataStore } from "../store/payload-data-store";

import { PayloadTableBulkActions } from "./PayloadTableBulkActions";
import { PayloadTableHeading } from "./TableHeading";

/**
 * Renders a table of queues.
 *
 * @returns The rendered QueuesWorkItemsTable component.
 */
export const WorkItemPayloadDataTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  const { qid } = useParams();

  const { isLoading, data: reaspose, refetch } = useFetchQueuesWorkItems();

  const { payloadData, setPayloadData, setCurrentWorkItem } =
    usePayloadDataStore(
      useShallow((state) => ({
        payloadData: state.payloadData,
        setPayloadData: state.setPayloadData,
        setCurrentWorkItem: state.setCurrentWorkItem,
      })),
    );

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (reaspose?.data?.payloadData) {
      setCurrentWorkItem(reaspose?.data);
      const jsonData: Record<string, string>[] = JSON.parse(
        reaspose?.data?.payloadData,
      );
      setPayloadData(jsonData);
    }
  }, [reaspose?.data, setCurrentWorkItem, setPayloadData, qid]);

  // Return the rendered DataTable component.
  return (
    <>
      {payloadData ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <DTHeading heading="Work Items" />
          </div>

          <DynacmicDataTable
            data={payloadData}
            isLoading={isLoading}
            TableHeading={() => <PayloadTableHeading />}
            formatDates={false}
            enableRowSelection={true}
            BulkActionElement={(table) => (
              <PayloadTableBulkActions table={table} />
            )}
          />
        </div>
      ) : (
        // Show data table skeleton while fetching the queues data
        <DataTableSkeleton />
      )}
    </>
  );
};
