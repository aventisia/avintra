import {
  DTPagination,
  DTSearchBox,
  DataTable,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable } from "@avplatform/ui/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { useMemo } from "react";

import { useFetchCreditUsageSummary } from "../hooks/useFetchCreditUsageSummary";
import { usageAgentsColumns } from "./usage-tables/usage-agents-columns";
import { usageUsersColumns } from "./usage-tables/usage-users-columns";

const USERS_TABLE_KEY = "usage-users";
const AGENTS_TABLE_KEY = "usage-agents";

/** Initial column visibility: hide nothing by default. */
const columnVisibilityState = {};

const UsageTables = () => {
  const { data } = useFetchCreditUsageSummary();
  const users = useMemo(() => data?.data.users ?? [], [data]);
  const agents = useMemo(() => data?.data.agents ?? [], [data]);

  const { columnVisibility: userColumnVisibility, sortState: userSortState } =
    getDataTablePreferences(USERS_TABLE_KEY, columnVisibilityState);
  const { columnVisibility: agentColumnVisibility, sortState: agentSortState } =
    getDataTablePreferences(AGENTS_TABLE_KEY, columnVisibilityState);

  const userColumns = useMemo(() => usageUsersColumns(USERS_TABLE_KEY), []);
  const agentColumns = useMemo(() => usageAgentsColumns(AGENTS_TABLE_KEY), []);

  const usersTable = useDataTable(userColumns, users, userColumnVisibility, userSortState, false);
  const agentsTable = useDataTable(
    agentColumns,
    agents,
    agentColumnVisibility,
    agentSortState,
    false,
  );

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-base font-medium">Usage by Users &amp; Agents</p>
        <div className="flex items-center gap-2">
          <DTSearchBox
            table={usersTable}
            searchColumns={["fullName"]}
            placeholder="Search users..."
          />
          <DTSearchBox
            table={agentsTable}
            searchColumns={["agentName"]}
            placeholder="Search agents..."
          />
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-white px-3 text-base">
          <TabsTrigger value="users" className="rounded-none data-[state=active]:border-b-black">
            Users
          </TabsTrigger>
          <TabsTrigger value="agents" className="rounded-none data-[state=active]:border-b-black">
            Agents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 pt-2">
          <DataTable table={usersTable} columnsLength={userColumns.length} />
          <DTPagination table={usersTable} singularLabel="user" pluralLabel="users" />
        </TabsContent>

        <TabsContent value="agents" className="space-y-4 pt-2">
          <DataTable table={agentsTable} columnsLength={agentColumns.length} />
          <DTPagination table={agentsTable} singularLabel="agent" pluralLabel="agents" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsageTables;
