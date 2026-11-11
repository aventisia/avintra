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
 * Folder page banner: the folder's mark, name, description, details and Edit/Delete buttons,
 * washed in the folder's color.
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
        "relative isolate overflow-hidden rounded-[20px] bg-gradient-to-br to-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/[0.06]",
        color.wash,
      )}
    >
      <FolderGlyph
        className={cn(
          "pointer-events-none absolute -bottom-12 right-24 -z-10 size-48 rotate-[-12deg] opacity-[0.08]",
          color.glyph,
        )}
      />
      <div className="flex items-start gap-4">
        <FolderMark
          color={color}
          size="xl"
          className="bg-white/80 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_6px_16px_-4px_rgba(15,23,42,0.12)]"
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
            Folder
          </p>
          <h2 className="truncate text-[20px] font-semibold tracking-[-0.01em] text-slate-900">
            {folder.name}
          </h2>
          {folder.description && (
            <p className="mt-0.5 line-clamp-2 max-w-3xl text-[13px] leading-5 text-slate-600">
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
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/80 px-3 text-[12.5px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-slate-900/[0.08] outline-none transition hover:bg-white hover:text-slate-900 hover:shadow-[0_2px_8px_-2px_rgba(15,23,42,0.18)] hover:ring-slate-900/[0.18] focus-visible:ring-2 focus-visible:ring-indigo-500/50 active:scale-[0.98]"
          >
            <PencilSquareIcon className="size-3.5" />
            Edit
          </button>
          <button
            type="button"
            aria-label={`Delete folder ${folder.name}`}
            title="Delete folder"
            onClick={() => openDialog({ kind: "delete", folder })}
            className="grid size-8 place-items-center rounded-lg text-slate-400 outline-none transition hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-500/50"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
