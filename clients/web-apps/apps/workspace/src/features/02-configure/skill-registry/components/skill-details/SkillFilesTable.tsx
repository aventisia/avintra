import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { Button } from "@avplatform/ui/buttons";
import {
  DTPagination,
  DTSearchBox,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable } from "@avplatform/ui/hooks";
import { DownloadIcon } from "lucide-react";
import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";

import { downloadSkillZip } from "../../apis/skill-registry-file.apis";
import { DETAIL_TABLE_KEY } from "../../constants";
import { columnVisibilityState } from "../../constants/skill-files-column-visibility-state.constant";
import { useFetchSkillById } from "../../hooks/useFetchSkillById.hook";
import { useFetchSkillFiles } from "../../hooks/useFetchSkillFiles.hook";
import { useTableTab } from "../../hooks/useTableTab.hook";
import { useSkillFilesDialogStore } from "../../stores/skill-files-upload-dialog.store";
import { SkillFileUploadDialog } from "./SkillFileUploadDialog";
import { getSkillFilesTableColumns } from "./SkillFilesTableColumns";
import { SkillMetadataSummary } from "./SkillMetadataSummary";
import { TableHeading } from "./TableHeading";

/**
 * Renders a table of skill files.
 */
export const SkillFilesTable = () => {
  const { id: skillId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const skillName = searchParams.get("skill") ?? "Skill not found";

  // Adding skill files creates sub-resources, which is disabled in Prod.
  const { locked } = useActionLock();

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    DETAIL_TABLE_KEY,
    columnVisibilityState,
  );

  // Yours/Platform tab state from URL
  const { isReadOnly } = useTableTab();

  // Fetch skill files data
  const { data } = useFetchSkillFiles(skillId);

  // Fetch the skill itself by id (a single detail request instead of scanning lists)
  const { data: skillData } = useFetchSkillById(skillId);
  const skill = skillData?.data;

  const columns = useMemo(() => getSkillFilesTableColumns(skillId, skill), [skillId, skill]);

  const canManageFiles = useMemo(() => {
    if (isReadOnly || !skill) return false;
    return (
      skill.accessLevel === ResourceAccessTypeEnum.Personal ||
      skill.accessLevel === ResourceAccessTypeEnum.Owner ||
      skill.accessLevel === ResourceAccessTypeEnum.FullAccess
    );
  }, [isReadOnly, skill]);

  const filteredColumns = useMemo(() => {
    if (canManageFiles) return columns;

    return columns.filter((column) => column.id !== "actions");
  }, [columns, canManageFiles]);

  // Create a React table for skill files data
  const table = useDataTable(filteredColumns, data?.data || [], columnVisibility, sortState, true);

  const { setShowDialog } = useSkillFilesDialogStore();

  const handleDownload = () => {
    downloadSkillZip(skillId).then((blob) => {
      const url = window.URL.createObjectURL(blob as Blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${skillName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  };

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 h-full pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <TableHeading skillName={skillName} />
            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["fileName"]} placeholder="Search..." />
              {canManageFiles && (
                <LockedActionTooltip>
                  <Button size="xs" disabled={locked} onClick={() => setShowDialog(true)}>
                    Add File
                  </Button>
                </LockedActionTooltip>
              )}
              <Button size="xs" variant="outline" onClick={handleDownload}>
                <DownloadIcon className="h-3.5 w-3.5 mr-1" />
                Download
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <SkillMetadataSummary skill={skill} />
            {/* Data table to render data */}
            <DataTable table={table} columnsLength={columns.length} />

            {/* Data table Pagination component */}
            <DTPagination table={table} singularLabel="File" pluralLabel="Files" />
          </div>
          <SkillFileUploadDialog skillId={skillId} skillName={skillName} />
        </div>
      ) : (
        // Show data table skeleton while fetching the skill files data
        <DataTableSkeleton />
      )}
    </>
  );
};
