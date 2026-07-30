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
import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { downloadSkillZip } from "../../apis/skill-file-apis";
import { DETAIL_TABLE_KEY } from "../../constants";
import { columnVisibilityState } from "../../constants/skill-files-column-visibility-state";
import { useFetchSkillFiles } from "../../hooks/useFetchSkillFiles";
import { useFetchSkills } from "../../hooks/useFetchSkills";
import { useSkillFilesDialogStore } from "../../stores/skill-files-upload-dialog-store";
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
  const navigate = useNavigate();
  const skillName = searchParams.get("skill") ?? "Skill not found";

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    DETAIL_TABLE_KEY,
    columnVisibilityState,
  );

  // Fetch skill files data
  const { data } = useFetchSkillFiles(skillId);
  const {
    data: skillData,
    isLoading: isSkillListLoading,
    isError: isSkillListError,
  } = useFetchSkills("all");

  const skill = useMemo(
    () => skillData?.data?.find((item) => item.id === skillId),
    [skillData?.data, skillId],
  );

  const columns = useMemo(() => getSkillFilesTableColumns(skillId, skill), [skillId, skill]);

  // If the skill does not exist in personal/shared lists and fetching has finished
  // without an error, revert the user back to the skills list.
  useEffect(() => {
    if (!isSkillListLoading && !isSkillListError && skillId && !skill) {
      navigate("/configure/skills");
    }
  }, [isSkillListLoading, isSkillListError, skillId, skill, navigate]);

  const canManageFiles = useMemo(() => {
    if (!skill) return false;
    return skill.accessLevel === "Owner" || skill.accessLevel === "FullAccess";
  }, [skill]);

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
                <Button size="xs" onClick={() => setShowDialog(true)}>
                  Add File
                </Button>
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
