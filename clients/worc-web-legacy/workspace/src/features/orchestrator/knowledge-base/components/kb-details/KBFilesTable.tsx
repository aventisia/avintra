// import { FileUploader } from "@/components/file-uploader/components";
import {
  DTPagination,
  DTSearchBox,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@aventisia/ui/data-table";
import { useDataTable } from "@aventisia/ui/hooks";
import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { DETAIL_TABLE_KEY } from "../../constants";
import { columnVisibilityState } from "../../constants/kb-files-column-visibility-state";
import { useFetchKBFiles } from "../../hooks/useFetchKBFiles";
import { useFetchKnowledgeBase } from "../../hooks/useFetchKnowledgeBase";
import AddFileDD from "./AddFileDropDown";
// import FileUploadDisclaimer from "./FileUploadDisclaimer";
import { KBFileUploadDialog } from "./KBFileUploadDialog";
import { getKBFilesTableColumns } from "./KBFilesTableColumns";
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
  const kbName = searchParams.get("kb") ?? "KB not found";

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    DETAIL_TABLE_KEY,
    columnVisibilityState,
  );

  // Fetch KBFilesFiles data
  const { data } = useFetchKBFiles(knowledgeBaseId);
  const { data: kbData } = useFetchKnowledgeBase();

  const knowledgeBase = useMemo(
    () => kbData?.data?.find((item) => item.id === knowledgeBaseId),
    [kbData?.data, knowledgeBaseId],
  );

  const columns = useMemo(
    () => getKBFilesTableColumns(knowledgeBaseId, knowledgeBase),
    [knowledgeBaseId, knowledgeBase],
  );
  // const data = { data: [] };

  // Create a React table for KBFilesFiles data
  const table = useDataTable(
    columns,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

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
              <DTSearchBox
                table={table}
                searchColumn={"fileName"}
                placeholder="Search..."
              />
              <AddFileDD />
            </div>
          </div>
          <div className="grid grid-cols-9 h-[calc(100vh-2.7*var(--header-height))] gap-3">
            <div className="col-span-6 space-y-4">
              {/* Data table to render data */}
              <DataTable table={table} columnsLength={columns.length} />

              {/* Data table Pagination component */}
              <DTPagination
                table={table}
                singularLabel="File"
                pluralLabel="Files"
              />
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
