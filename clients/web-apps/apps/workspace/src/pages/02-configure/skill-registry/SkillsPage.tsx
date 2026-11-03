import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the SkillTable component.
const SkillTable = lazy(() =>
  import("@/features/02-configure/skill-registry/components/SkillTable").then((module) => ({
    default: module.SkillTable,
  })),
);

/**
 * Renders the SkillPage component.
 */
export const SkillPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <SkillTable />
    </Suspense>
  );
};
