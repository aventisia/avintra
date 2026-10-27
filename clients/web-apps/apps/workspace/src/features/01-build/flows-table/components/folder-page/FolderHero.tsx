import { cn } from "@avplatform/ui/lib";
import { formatDate } from "@avplatform/ui/utils";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

import { MetaLine } from "@/components/MetaLine";
import { pluralize } from "@/utils/pluralize.util";

import { useFolderFormDialog } from "../../hooks/useFolderFormDialog.hook";
import { useFolderDialogStore } from "../../stores/folder-dialog.store";
import { FolderSummary } from "../../types/folder-summary.type";
import { getFolderColor } from "../../utils/folder-color.util";
import { FolderGlyph } from "../folder/FolderGlyph";
import { FolderMark } from "../folder/FolderMark";

/**
 * Folder page banner: the folder's mark, name, description, details and Edit/Delete buttons.
 */
export const FolderHero = ({
  summary: { folder, visibleAgentCount },
}: {
  summary: FolderSummary;
}) => {
  const color = getFolderColor(folder);
  const openDialog = useFolderDialogStore((state) => state.openDialog);
  const { openEditFolderDialog } = useFolderFormDialog();

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-lg bg-surface px-5 py-4 ring-1 ring-line",
      )}
    >
      <FolderGlyph
        className={cn(
          "pointer-events-none absolute -bottom-12 right-24 -z-10 size-48 rotate-[-12deg] opacity-[0.08]",
          color.glyph,
        )}
      />
      <div className="flex items-start gap-4">
        <FolderMark color={color} size="xl" className="bg-surface" />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-mono text-label uppercase text-muted-foreground">Folder</p>
          <h2 className="truncate text-title text-ink">{folder.name}</h2>
          {folder.description && (
            <p className="mt-0.5 line-clamp-2 max-w-3xl text-[13px] leading-5 text-ink-2">
              {folder.description}
            </p>
          )}
          <MetaLine
            className="mt-2 text-[12px] text-muted-foreground"
            items={[
              `${visibleAgentCount} ${pluralize(visibleAgentCount, "agent")}`,
              folder.createdBy && `Created by ${folder.createdBy}`,
              formatDate(folder.createdOn),
            ]}
          />
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => openEditFolderDialog(folder.id)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-surface px-3 text-[12.5px] font-medium text-ink-2 ring-1 ring-line-strong outline-none transition hover:bg-hover hover:text-ink focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
          >
            <PencilSquareIcon className="size-3.5" />
            Edit
          </button>
          <button
            type="button"
            aria-label={`Delete folder ${folder.name}`}
            title="Delete folder"
            onClick={() => openDialog({ kind: "delete", folder })}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground outline-none transition hover:bg-bad/10 hover:text-bad focus-visible:ring-2 focus-visible:ring-focus"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
