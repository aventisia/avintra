import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the OnPremLLM component.
const OnPremLLMTable = lazy(() =>
  import(
    "@/features/06-super-admin/on-prem-llm-table/components/OnPremLLMTable"
  ).then((module) => ({
    default: module.OnPremLLMTable,
  })),
);

/**
 * Renders the OnPremLLM component.
 * @returns JSX element representing the OnPremLLM component.
 */
export const OnPremLLMPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <OnPremLLMTable />
    </Suspense>
  );
};
