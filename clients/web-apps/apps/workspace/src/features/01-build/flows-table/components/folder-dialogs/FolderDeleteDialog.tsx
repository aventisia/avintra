import { TriangleAlert } from "lucide-react";
import { motion } from "motion/react";
import { useMatch, useNavigate } from "react-router-dom";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { pluralize } from "@/utils/pluralize.util";

import { AGENTS_PAGE_PATH, FOLDER_PAGE_PATH_PATTERN } from "../../constants";
import { FoldersTableRowDto } from "../../dtos/folders-table-row.dto";
import { useDeleteFolder } from "../../hooks/useDeleteFolder.hook";
import { getFolderColor } from "../../utils/folder-color.util";
import { AgentsRootMark, FolderMark } from "../folder/FolderMark";

type FolderDeleteDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  folder: FoldersTableRowDto;
  visibleAgentCount: number;
};

const FLOWING_DOTS = [0, 1, 2];

const AgentsFlowArrow = ({ count }: { count: number }) => (
  <div className="flex flex-col items-center gap-1.5">
    <span className="rounded-full bg-popover px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-2 shadow-sm ring-1 ring-border">
      {count} {pluralize(count, "agent")}
    </span>
    <div className="relative h-1.5 w-20 overflow-hidden" aria-hidden="true">
      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-fill" />
      {FLOWING_DOTS.map((index) => (
        <motion.span
          key={index}
          className="absolute top-0 size-1.5 rounded-full bg-primary"
          initial={{ x: -6, opacity: 0 }}
          animate={{ x: [-6, 80], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.6, ease: "easeInOut" }}
        />
      ))}
    </div>
  </div>
);

const ImpactDiagram = ({ folder, count }: { folder: FoldersTableRowDto; count: number }) => (
  <div className="flex items-end justify-center gap-4 rounded-xl bg-sunken/80 px-4 pb-3.5 pt-4 ring-1 ring-line">
    <figure className="flex w-24 flex-col items-center gap-1.5">
      <FolderMark color={getFolderColor(folder)} size="lg" />
      <figcaption className="max-w-full truncate text-[12px] font-medium text-ink-2">
        {folder.name}
      </figcaption>
    </figure>
    {count > 0 && (
      <>
        <div className="pb-[30px]">
          <AgentsFlowArrow count={count} />
        </div>
        <figure className="flex w-24 flex-col items-center gap-1.5">
          <AgentsRootMark size="lg" />
          <figcaption className="text-[12px] font-medium text-ink-2">Agents</figcaption>
        </figure>
      </>
    )}
  </div>
);

/**
 * Confirms deleting a folder and shows where its agents go. Leaves the folder page when the
 * deleted folder is open.
 */
export const FolderDeleteDialog = ({
  isOpen,
  onClose,
  folder,
  visibleAgentCount,
}: FolderDeleteDialogProps) => {
  const navigate = useNavigate();
  const folderPageMatch = useMatch(FOLDER_PAGE_PATH_PATTERN);
  const { deleteFolder, isDeleting } = useDeleteFolder();
  const agentCount = folder.flowCount;
  const hiddenAgentCount = Math.max(agentCount - visibleAgentCount, 0);

  const handleDelete = async () => {
    try {
      await deleteFolder(folder);
    } catch {
      return;
    }
    onClose();
    if (folderPageMatch?.params.folderId === folder.id) {
      navigate(AGENTS_PAGE_PATH, { replace: true });
    }
  };

  return (
    <CardDialog
      isOpen={isOpen}
      onClose={onClose}
      isDismissLocked={isDeleting}
      mark={<FolderMark color={getFolderColor(folder)} size="lg" />}
      eyebrow="Delete folder"
      eyebrowClassName="text-bad"
      title={folder.name}
      footer={
        <>
          <p className="flex min-w-0 items-center gap-2 text-[12.5px] text-muted-foreground">
            <TriangleAlert className="size-4 shrink-0 text-warn" />
            <span className="truncate">The folder can’t be restored</span>
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton data-autofocus onClick={onClose} disabled={isDeleting}>
              Cancel
            </CardDialogButton>
            <CardDialogButton variant="danger" onClick={handleDelete} isBusy={isDeleting}>
              {isDeleting ? "Deleting" : "Delete folder"}
            </CardDialogButton>
          </div>
        </>
      }
    >
      <ImpactDiagram folder={folder} count={agentCount} />
      <p className="mt-4 text-[13px] leading-5 text-ink-2">
        {agentCount === 0 ? (
          "This folder is empty, so nothing else changes."
        ) : (
          <>
            Its{" "}
            <span className="font-semibold text-ink">
              {agentCount} {pluralize(agentCount, "agent")}
            </span>{" "}
            move back to <span className="font-semibold text-ink">Agents</span>. No agent is
            deleted, and who can access each agent stays the same.
          </>
        )}
      </p>
      {hiddenAgentCount > 0 && (
        <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
          {hiddenAgentCount} of them {hiddenAgentCount === 1 ? "is" : "are"} not shown here or not
          shared with you.
        </p>
      )}
    </CardDialog>
  );
};
