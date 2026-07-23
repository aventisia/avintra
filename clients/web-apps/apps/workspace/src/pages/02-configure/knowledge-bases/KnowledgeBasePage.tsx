import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the KnowledgeBaseTable component.
const KnowledgeBaseTable = lazy(() =>
  import("@/features/02-configure/knowledge-base/components/KnowledgeBaseTable").then((module) => ({
    default: module.KnowledgeBaseTable,
  })),
);

/**
 * Renders the KnowledgeBasePage component.
 * @returns JSX element representing the KnowledgeBaseTable component.
 */
export const KnowledgeBasePage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <KnowledgeBaseTable />
    </Suspense>
  );
};
