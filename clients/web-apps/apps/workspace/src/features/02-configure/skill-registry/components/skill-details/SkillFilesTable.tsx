import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { Button } from "@avplatform/ui/buttons";
import { TableCN, TableCNSkeleton, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";

import { downloadSkillZip } from "../../apis/skill-registry-file.apis";
import {
  DETAIL_TABLE_KEY,
  SKILL_FILES_INITIAL_STATE,
  SKILL_FILES_PAGE_SIZE_OPTIONS,
  SKILL_FILES_ROW_LABELS,
} from "../../constants";
import { useFetchSkillById } from "../../hooks/useFetchSkillById.hook";
import { useFetchSkillFiles } from "../../hooks/useFetchSkillFiles.hook";
import { useTableTab } from "../../hooks/useTableTab.hook";
import { useSkillFilesDialogStore } from "../../stores/skill-files-upload-dialog.store";
import { SkillFileUploadDialog } from "./SkillFileUploadDialog";
import { getSkillFilesTableColumns } from "./SkillFilesTableColumns";
import { SkillMetadataSummary } from "./SkillMetadataSummary";
import { TableHeading } from "./TableHeading";

const PAGINATION_PROPS = {
  pageSizeOptions: SKILL_FILES_PAGE_SIZE_OPTIONS,
  rowLabels: SKILL_FILES_ROW_LABELS,
};

/**
 * Renders a table of skill files.
 */
export const SkillFilesTable = () => {
  const { id: skillId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const skillName = searchParams.get("skill") ?? "Skill not found";

  // Adding skill files creates sub-resources, which is disabled in Prod.
  const { locked } = useActionLock();

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

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: filteredColumns,
    initialState: SKILL_FILES_INITIAL_STATE,
    persistKey: DETAIL_TABLE_KEY,
    searchColumns: ["fileName"],
  });

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

  return (
    <>
      {data ? (
        <div className="space-y-4 h-full pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <TableHeading skillName={skillName} />
            <div className="flex items-center gap-2">
              {canManageFiles && (
                <LockedActionTooltip>
                  <Button size="xs" disabled={locked} onClick={() => setShowDialog(true)}>
                    Add file
                  </Button>
                </LockedActionTooltip>
              )}
              <Button size="xs" variant="outline" onClick={handleDownload}>
                <DownloadSimpleIcon className="h-3.5 w-3.5 mr-1" />
                Download
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <SkillMetadataSummary skill={skill} />
            {/* Table with its toolbar and pagination footer */}
            <TableCN table={table} label="Files" paginationProps={PAGINATION_PROPS}>
              <TableCNToolbar table={table} searchPlaceholder="Search..." withViewOptions={false} />
            </TableCN>
          </div>
          <SkillFileUploadDialog skillId={skillId} skillName={skillName} />
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the skill files data
        <TableCNSkeleton columnCount={5} withViewOptions={false} />
      )}
    </>
  );
};
