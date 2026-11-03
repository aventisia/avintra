import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the SkillFilesTable component.
const SkillFilesTable = lazy(() =>
  import("@/features/02-configure/skill-registry/components/skill-details/SkillFilesTable").then(
    (module) => ({
      default: module.SkillFilesTable,
    }),
  ),
);

/**
 * Renders the SkillDetailsPage component.
 */
export const SkillDetailsPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <SkillFilesTable />
    </Suspense>
  );
};
