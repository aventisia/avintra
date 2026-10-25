import { useTableCN } from "@avplatform/ui/table-cn";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import {
  AGENTS_SEARCH_COLUMNS,
  AGENTS_TABLE_INITIAL_STATE,
} from "../constants/agents-table.constant";
import { FlowsTableDto } from "../dtos/flows-table-dto";

type UseAgentsTableOptions = {
  agents: FlowsTableDto[];
  columns: ColumnDef<FlowsTableDto>[];
  searchText: string;
  onSearchTextChange: (searchText: string) => void;
};

const getAgentRowId = (flow: FlowsTableDto) => flow.id ?? "";

/**
 * Agents table of the Agents and folder pages: searches names, keeps the page, page size, and
 * sorting in the URL, and remembers column visibility and sorting in this browser.
 */
export const useAgentsTable = ({
  agents,
  columns,
  searchText,
  onSearchTextChange,
}: UseAgentsTableOptions) =>
  useTableCN({
    data: agents,
    columns,
    getRowId: getAgentRowId,
    initialState: AGENTS_TABLE_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: AGENTS_SEARCH_COLUMNS,
    globalFilter: searchText,
    onGlobalFilterChange: onSearchTextChange,
  });
