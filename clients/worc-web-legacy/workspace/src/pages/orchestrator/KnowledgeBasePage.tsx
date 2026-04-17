import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the KnowledgeBaseTable component.
const KnowledgeBaseTable = lazy(() =>
  import(
    "@/features/orchestrator/knowledge-base/components/KnowledgeBaseTable"
  ).then((module) => ({
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
