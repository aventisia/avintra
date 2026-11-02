import { TableCN, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { type InitialTableState } from "@tanstack/react-table";
import { useMemo } from "react";

import { useFetchByokUsageSummary } from "../hooks/useFetchByokUsageSummary.ee";
import { byokUsageAgentsColumns } from "./usage-tables/byok-usage-agents-columns.ee";
import { byokUsageUsersColumns } from "./usage-tables/byok-usage-users-columns.ee";

const USERS_TABLE_KEY = "byok-usage-users";
const AGENTS_TABLE_KEY = "byok-usage-agents";

/** Page sizes offered by both tables, unchanged from the legacy tables. */
const USAGE_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const USAGE_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
};

// Both tables share one page, so each keeps its paging out of the other's URL keys.
const USERS_QUERY_KEYS = {
  page: "byokUsersPage",
  perPage: "byokUsersPerPage",
  sort: "byokUsersSort",
};
const AGENTS_QUERY_KEYS = {
  page: "byokAgentsPage",
  perPage: "byokAgentsPerPage",
  sort: "byokAgentsSort",
};

const USERS_PAGINATION_PROPS = {
  pageSizeOptions: USAGE_PAGE_SIZE_OPTIONS,
  rowLabels: { singular: "user", plural: "users" },
};

const AGENTS_PAGINATION_PROPS = {
  pageSizeOptions: USAGE_PAGE_SIZE_OPTIONS,
  rowLabels: { singular: "agent", plural: "agents" },
};

const ByokUsageTables = () => {
  const { data } = useFetchByokUsageSummary();
  const users = useMemo(() => data?.data.users ?? [], [data]);
  const agents = useMemo(() => data?.data.agents ?? [], [data]);

  const { table: usersTable } = useTableCN({
    data: users,
    columns: byokUsageUsersColumns,
    initialState: USAGE_INITIAL_STATE,
    queryKeys: USERS_QUERY_KEYS,
    persistKey: USERS_TABLE_KEY,
    searchColumns: ["fullName"],
  });

  const { table: agentsTable } = useTableCN({
    data: agents,
    columns: byokUsageAgentsColumns,
    initialState: USAGE_INITIAL_STATE,
    queryKeys: AGENTS_QUERY_KEYS,
    persistKey: AGENTS_TABLE_KEY,
    searchColumns: ["agentName"],
  });

  return (
    <div className="space-y-4 rounded-lg border bg-surface p-4">
      <p className="text-base font-medium">Usage by Users &amp; Agents</p>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-transparent px-3 text-base">
          <TabsTrigger value="users" className="rounded-none">
            Users
          </TabsTrigger>
          <TabsTrigger value="agents" className="rounded-none">
            Agents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 pt-2">
          <TableCN table={usersTable} paginationProps={USERS_PAGINATION_PROPS}>
            <TableCNToolbar
              table={usersTable}
              searchPlaceholder="Search users..."
              withViewOptions={false}
            />
          </TableCN>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4 pt-2">
          <TableCN table={agentsTable} paginationProps={AGENTS_PAGINATION_PROPS}>
            <TableCNToolbar
              table={agentsTable}
              searchPlaceholder="Search agents..."
              withViewOptions={false}
            />
          </TableCN>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ByokUsageTables;
