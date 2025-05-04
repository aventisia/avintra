import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Tabs, TabsContent } from "@aventisia/ui/tabs";
import { lazy, Suspense } from "react";

const MachinesTable = lazy(() =>
  import("./MachinesTable").then((module) => ({
    default: module.MachinesTable,
  })),
);

const AgentsTable = lazy(() =>
  import("../../agents-table/components/AgentsTable").then((module) => ({
    default: module.AgentsTable,
  })),
);

export const MachineTabs = () => {
  return (
    <Tabs defaultValue="machines">
      <TabsContent value="machines">
        <Suspense fallback={<DataTableSkeleton />}>
          <MachinesTable />
        </Suspense>
      </TabsContent>
      <TabsContent value="agents">
        <Suspense fallback={<DataTableSkeleton />}>
          <AgentsTable />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
};
