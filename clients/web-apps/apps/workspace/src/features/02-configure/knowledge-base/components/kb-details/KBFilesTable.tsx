import { TableCN, TableCNSkeleton, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useConfigureResourceAccessActions } from "@/features/02-configure/hooks/useConfigureResourceAccessActions.hook";
import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";

import {
  DETAIL_TABLE_KEY,
  KB_FILES_INITIAL_STATE,
  KB_FILES_PAGE_SIZE_OPTIONS,
  KB_FILES_ROW_LABELS,
} from "../../constants";
import { useFetchKBFiles } from "../../hooks/useFetchKBFiles";
import { useFetchKnowledgeBase } from "../../hooks/useFetchKnowledgeBase";
import AddFileDD from "./AddFileDropDown";
// import FileUploadDisclaimer from "./FileUploadDisclaimer";
import { KBFileUploadDialog } from "./KBFileUploadDialog";
import { getKBFilesTableColumns } from "./KBFilesTableColumns";
import { KBMetadataSummary } from "./KBMetadataSummary";
import { KBRetrievalSection } from "./KBRetrievalSection";
import { TableHeading } from "./TableHeading";

const PAGINATION_PROPS = {
  pageSizeOptions: KB_FILES_PAGE_SIZE_OPTIONS,
  rowLabels: KB_FILES_ROW_LABELS,
};

/**
 * Renders a table of KBFilesFiles.
 *
 * @returns The rendered KBFilesTable component.
 */
export const KBFilesTable = () => {
  const { id: knowledgeBaseId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const kbName = searchParams.get("kb") ?? "KB not found";

  // Fetch KBFilesFiles data
  const { data, isLoading } = useFetchKBFiles(knowledgeBaseId);
  const { data: kbData } = useFetchKnowledgeBase();

  const knowledgeBase = useMemo(
    () => kbData?.data?.find((item) => item.id === knowledgeBaseId),
    [kbData?.data, knowledgeBaseId],
  );

  // Resolve Prod-capped actions so the file table's read-only gate matches the row actions.
  const { actions, isProd } = useConfigureResourceAccessActions(
    knowledgeBase?.accessLevel ?? ResourceAccessTypeEnum.View,
  );

  const columns = useMemo(
    () => getKBFilesTableColumns(knowledgeBaseId, knowledgeBase),
    [knowledgeBaseId, knowledgeBase],
  );

  // if the KB does not exist in KB list/shared revert user back to kb
  useEffect(() => {
    if (!isLoading && !knowledgeBase) navigate("/configure/knowledge-base");
  }, [isLoading, knowledgeBase, navigate]);

  const hasOnlyReadAccess = useMemo(() => {
    if (!knowledgeBase) return true;
    return isProd ? !actions.update : knowledgeBase.accessLevel === "View";
  }, [knowledgeBase, isProd, actions.update]);

  const filteredColumns = useMemo(() => {
    if (!hasOnlyReadAccess) return columns;

    return columns.filter((column) => column.id !== "actions");
  }, [columns, hasOnlyReadAccess]);

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: filteredColumns,
    initialState: KB_FILES_INITIAL_STATE,
    persistKey: DETAIL_TABLE_KEY,
    searchColumns: ["fileName"],
  });

  // Return the rendered table.
  return (
    <>
      {data ? (
        <div className="space-y-4 h-full   pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <TableHeading kbName={kbName} />
            <div className="flex items-center gap-2">{!hasOnlyReadAccess && <AddFileDD />}</div>
          </div>
          <div className="grid grid-cols-9 h-[calc(100vh-2.7*var(--header-height))] gap-3">
            <div className="col-span-6 space-y-4">
              <KBMetadataSummary knowledgeBase={knowledgeBase} />
              {/* Data table with its toolbar and pagination footer */}
              <TableCN table={table} label="Files" paginationProps={PAGINATION_PROPS}>
                <TableCNToolbar
                  table={table}
                  searchPlaceholder="Search..."
                  withViewOptions={false}
                />
              </TableCN>
            </div>
            <div className="col-span-3 border border-line bg-surface rounded-lg">
              <KBRetrievalSection
                knowledgeBaseId={knowledgeBaseId}
                knowledgeBaseName={kbName}
                knowledgeBase={knowledgeBase}
              />
            </div>
          </div>
          <KBFileUploadDialog
            knowledgeBaseId={knowledgeBaseId}
            knowledgeBaseName={kbName}
            knowledgeBase={knowledgeBase}
          />
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the KB files data
        <TableCNSkeleton columnCount={6} withSearch withViewOptions={false} />
      )}
    </>
  );
};
