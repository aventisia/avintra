import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { lazy, Suspense } from "react";

// Lazy load the ProjectsTable component.
const ProjectsTable = lazy(() =>
  import("@/features/projects-table/components/ProjectsTable").then((module) => ({
    default: module.ProjectsTable,
  })),
);

/**
 * Renders the ProjectsPage component.
 * @returns JSX element representing the ProjectsPage component.
 */
export const ProjectsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <ProjectsTable />
    </Suspense>
  );
};
