import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the KBFilesTable component.
const KBFilesTable = lazy(() =>
  import(
    "@/features/orchestrator/knowledge-base/components/kb-details/KBFilesTable"
  ).then((module) => ({
    default: module.KBFilesTable,
  })),
);

/**
 * Renders the KnowledgeBaseDetailsPage component.
 * @returns JSX element representing the KBFilesTable component.
 */
export const KnowledgeBaseDetailsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <KBFilesTable />
    </Suspense>
  );
};
