import { EmptyState } from "@avplatform/ui";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import {
  TableCN,
  TableCNHeading,
  TableCNPagination,
  TableCNSkeleton,
  TableCNSortMenu,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";
import { ViewModeToggle } from "@avplatform/ui/view-mode-toggle";
import { BooksIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { FlowsGridSkeleton } from "@/features/01-build/flows-table/components/FlowsGridSkeleton";
import { useFlowsView } from "@/features/01-build/flows-table/hooks/useFlowsView";

import {
  LIBRARY_HEADING,
  LIBRARY_INITIAL_STATE,
  LIBRARY_PAGE_SIZE_OPTIONS,
  LIBRARY_ROW_LABELS,
  LIBRARY_TABLE_KEY,
} from "../constants/library.constant";
import { useFetchProjectTemplates } from "../hooks/useFetchProjectTemplates";
import { useTemplateLinks } from "../hooks/useTemplateLinks.hook";
import { libraryTableColumns } from "./LibraryTableColumns";
import { TemplateCard } from "./TemplateCard";
import { TemplateDetail } from "./template-details/TemplateDetails";

const PAGINATION_PROPS = {
  pageSizeOptions: LIBRARY_PAGE_SIZE_OPTIONS,
  rowLabels: LIBRARY_ROW_LABELS,
};

const LibraryList = () => {
  useDocumentTitle(LIBRARY_HEADING);

  const navigate = useNavigate();
  const { getTemplateLink } = useTemplateLinks();
  const { view, setView } = useFlowsView(LIBRARY_TABLE_KEY);
  const { data, isLoading } = useFetchProjectTemplates();

  // Page, size, sorting and filters live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: libraryTableColumns,
    getRowId: (template) => template.id,
    initialState: LIBRARY_INITIAL_STATE,
    persistKey: LIBRARY_TABLE_KEY,
    searchColumns: ["name", "tags"],
  });
  const rows = table.getRowModel().rows;
  const searchText = String(table.getState().globalFilter ?? "");

  if (isLoading) {
    return view === "grid" ? (
      <div className="pb-4 pt-[17px]">
        <FlowsGridSkeleton />
      </div>
    ) : (
      <TableCNSkeleton columnCount={6} withSearch className="py-5" />
    );
  }

  return (
    <div className="space-y-4 pb-4 pt-[17px]">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <TableCNHeading heading={LIBRARY_HEADING} />
          <p className="mt-[5px] text-[13px] text-muted-foreground">
            Ready-to-use agents, blocks and prompts to clone and build on.
          </p>
        </div>
        <ViewModeToggle view={view} onChange={setView} />
      </div>

      <TableCNToolbar
        table={table}
        searchPlaceholder="Search templates and tags..."
        withViewOptions={view === "table"}
      >
        <TableCNSortMenu table={table} />
      </TableCNToolbar>

      {rows.length === 0 ? (
        <EmptyState
          Icon={BooksIcon}
          primaryMessage="No templates found"
          secondaryMessage="Try adjusting your search or filters."
          className="h-52"
        />
      ) : view === "grid" ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 2xl:grid-cols-4 2xl:gap-6">
            {rows.map((row) => (
              <TemplateCard
                key={row.id}
                template={row.original}
                to={getTemplateLink(row.original.id)}
                searchText={searchText}
              />
            ))}
          </div>
          <TableCNPagination table={table} {...PAGINATION_PROPS} />
        </div>
      ) : (
        <TableCN
          table={table}
          label={LIBRARY_HEADING}
          paginationProps={PAGINATION_PROPS}
          getRowProps={(row) => ({
            className: "cursor-pointer",
            onClick: () => navigate(getTemplateLink(row.original.id)),
          })}
        />
      )}
    </div>
  );
};

/**
 * The Avintra library: a filterable grid or table of templates, or one template's page when
 * the URL names a template.
 */
const TemplatesLibrary = () => {
  const { templateId } = useTemplateLinks();

  return templateId ? <TemplateDetail /> : <LibraryList />;
};

export default TemplatesLibrary;
