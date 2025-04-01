import { Tabs, TabsContent, TabsList } from "@/react-toolkit/ui/tabs";
import { MachinesTable } from "./MachinesTable";
import { TabsTrigger } from "@radix-ui/react-tabs";
import { twMerge } from "tailwind-merge";
import { lazy } from "react";

export const MachineTabs = () => {
  // Lazy load the AgentsTable component.
  const AgentsTable = lazy(() =>
    import("@/features/orchestrator/agents-table/components/AgentsTable").then(
      (module) => ({
        default: module.AgentsTable,
      }),
    ),
  );
  return (
    <Tabs defaultValue="machines" className="delay-800 transition-all">
      <TabsContent value="machines">
        <MachinesTable />
      </TabsContent>
      <TabsContent value="agents">
        <AgentsTable />
      </TabsContent>
    </Tabs>
  );
};

export const MachineTabsList = () => {
  return (
    <TabsList className="me-2 flex flex-row rounded-md bg-slate-100 px-2 text-center text-sm font-medium">
      <TabsTrigger
        className={twMerge(
          "aria-selected:font-semibold aria-selected:text-primary",
          "inline-block rounded-lg px-4 py-1 hover:bg-gray-100 hover:text-gray-900 aria-selected:bg-white aria-selected:shadow-md dark:hover:bg-gray-800 dark:hover:text-white",
        )}
        value="machines"
      >
        Machines
      </TabsTrigger>
      <TabsTrigger
        className={twMerge(
          "aria-selected:font-semibold aria-selected:text-primary",
          "inline-block rounded-lg px-4 py-1 hover:bg-gray-100 hover:text-gray-900 aria-selected:bg-white aria-selected:shadow-md dark:hover:bg-gray-800 dark:hover:text-white",
        )}
        value="agents"
      >
        Agents
      </TabsTrigger>
    </TabsList>
  );
};
