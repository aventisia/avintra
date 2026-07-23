import {
  DTPagination,
  DTSearchBox,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable } from "@avplatform/ui/hooks";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { DETAIL_TABLE_KEY } from "../../constants";
import { columnVisibilityState } from "../../constants/kb-files-column-visibility-state";
import { useFetchKBFiles } from "../../hooks/useFetchKBFiles";
import { useFetchKnowledgeBase } from "../../hooks/useFetchKnowledgeBase";
import AddFileDD from "./AddFileDropDown";
// import FileUploadDisclaimer from "./FileUploadDisclaimer";
import { KBFileUploadDialog } from "./KBFileUploadDialog";
import { getKBFilesTableColumns } from "./KBFilesTableColumns";
import { KBMetadataSummary } from "./KBMetadataSummary";
import { KBRetrievalSection } from "./KBRetrievalSection";
import { TableHeading } from "./TableHeading";

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

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    DETAIL_TABLE_KEY,
    columnVisibilityState,
  );

  // Fetch KBFilesFiles data
  const { data, isLoading } = useFetchKBFiles(knowledgeBaseId);
  const { data: kbData } = useFetchKnowledgeBase();

  const knowledgeBase = useMemo(
    () => kbData?.data?.find((item) => item.id === knowledgeBaseId),
    [kbData?.data, knowledgeBaseId],
  );

  const columns = useMemo(
    () => getKBFilesTableColumns(knowledgeBaseId, knowledgeBase),
    [knowledgeBaseId, knowledgeBase],
  );

  // if the KB does not exist in KB list/shared revert user back to kb
  useEffect(() => {
    if (!isLoading && !knowledgeBase) navigate("/configure/knowledge-base");
  }, [isLoading, knowledgeBase]);

  const hasOnlyReadAccess = useMemo(() => {
    if (!knowledgeBase) return true;
    return knowledgeBase?.accessLevel == "View";
  }, [knowledgeBase]);

  const filteredColumns = useMemo(() => {
    if (!hasOnlyReadAccess) return columns;

    return columns.filter((column) => column.id !== "actions");
  }, [columns, hasOnlyReadAccess]);

  // Create a React table for KBFiles data
  const table = useDataTable(filteredColumns, data?.data || [], columnVisibility, sortState, true);

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        // <div className='h-[calc(100vh-2.5*var(--header-height))] grid grid-cols-10 gap-5'>

        <div className="space-y-4 h-full   pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <TableHeading kbName={kbName} />
            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["fileName"]} placeholder="Search..." />
              {!hasOnlyReadAccess && <AddFileDD />}
            </div>
          </div>
          <div className="grid grid-cols-9 h-[calc(100vh-2.7*var(--header-height))] gap-3">
            <div className="col-span-6 space-y-4">
              <KBMetadataSummary knowledgeBase={knowledgeBase} />
              {/* Data table to render data */}
              <DataTable table={table} columnsLength={columns.length} />

              {/* Data table Pagination component */}
              <DTPagination table={table} singularLabel="File" pluralLabel="Files" />
              {/* <div className="h-fit">
                <FileUploader
                  hideFooter
                  disclaimer={<FileUploadDisclaimer />}
                  acceptedTypes={{
                    "application/pdf": [".pdf"],
                    "image/jpeg": [".jpg", ".jpeg"],
                  }}
                />
              </div> */}
            </div>
            <div className="col-span-3 border bg-background rounded-lg">
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
        // Show data table skeleton while fetching the WorkItems data
        <DataTableSkeleton />
      )}
    </>
  );
};
