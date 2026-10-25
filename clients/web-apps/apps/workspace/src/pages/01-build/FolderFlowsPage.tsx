import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";
import { useParams } from "react-router-dom";

const FolderFlowsTable = lazy(() =>
  import("@/features/01-build/flows-table/components/FolderFlowsTable").then((module) => ({
    default: module.FolderFlowsTable,
  })),
);

/**
 * Renders the page that lists the agents of one folder; switching folders starts a fresh list.
 */
export const FolderFlowsPage = () => {
  const { folderId = "" } = useParams();

  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <FolderFlowsTable key={folderId} folderId={folderId} />
    </Suspense>
  );
};
