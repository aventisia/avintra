import { Button, buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import {
  PopoverContent,
  PopoverDefaultHeader,
  PopoverTrigger,
  PopoverWrapper,
} from "@avplatform/ui/popover";
import { Tooltip } from "@avplatform/ui/tooltip";
import { BookmarkIcon, CaretDownIcon, CircleNotchIcon, PencilIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { updateUiBuilderVersionLabel } from "../apis/ui-builder.apis";
import { useRestoreUiBuilderVersion } from "../hooks/useRestoreUiBuilderVersion.hook";
import {
  UI_BUILDER_VERSIONS_QUERY_KEY,
  useUiBuilderProject,
} from "../hooks/useUiBuilderProject.hook";
import { useUiBuilderVersionsStore } from "../stores/ui-builder-versions.store";

const CROSS_FORMAT_RESTORE_REASON = "Restoring a version of a different format is not supported.";

const formatLabel = (value?: string) => (value === "framework" ? "React" : "HTML");

/** Header version control for the custom UI builder: head pill plus restore list. */
export const UiBuilderVersions = () => {
  const { projectId, isPopoverOpen, togglePopoverOpen } = useUiBuilderVersionsStore(
    useShallow((state) => ({
      projectId: state.projectId,
      isPopoverOpen: state.isPopoverOpen,
      togglePopoverOpen: state.togglePopoverOpen,
    })),
  );

  const { versionsQuery } = useUiBuilderProject(projectId);
  const { restoreMutation } = useRestoreUiBuilderVersion(projectId);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<{ versionNumber: number; label: string } | null>(null);
  const labelMutation = useMutation({
    mutationFn: ({ versionNumber, label }: { versionNumber: number; label: string }) =>
      updateUiBuilderVersionLabel(projectId, versionNumber, label.trim() || null),
    onSuccess: () => {
      setEditing(null);
      void queryClient.invalidateQueries({
        queryKey: [...UI_BUILDER_VERSIONS_QUERY_KEY, projectId],
      });
    },
  });

  const versions = useMemo(
    () =>
      [...(versionsQuery.data?.data ?? [])].sort(
        (left, right) => right.versionNumber - left.versionNumber,
      ),
    [versionsQuery.data],
  );
  const headVersion = versions[0];

  return (
    <PopoverWrapper open={isPopoverOpen} onOpenChangeFn={() => togglePopoverOpen()}>
      <Tooltip content="Versions">
        <PopoverTrigger
          disabled={!projectId}
          className={cn(
            buttonVariants({ variant: "ghost", size: "xs" }),
            "group h-7 max-w-[15rem] shrink-0 gap-2 rounded-full bg-white/10 pl-3 pr-2.5 font-bold text-white/80 hover:bg-white/20 hover:text-white/80",
          )}
        >
          <span className="min-w-0 truncate">
            {headVersion ? `v${headVersion.versionNumber}` : "v—"}
          </span>
          {versionsQuery.isLoading || restoreMutation.isPending ? (
            <CircleNotchIcon className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CaretDownIcon className="h-3 w-3 shrink-0 transition-all group-hover:mt-0.5" />
          )}
        </PopoverTrigger>
      </Tooltip>

      <PopoverContent align="end" variant={"responsive"} className="ml-1 mt-1.5">
        <PopoverDefaultHeader heading={"Versions"} />
        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto p-2">
          {versions.length === 0 ? (
            <p className="px-2 py-3 text-2xs text-muted-foreground">No versions yet.</p>
          ) : (
            versions.map((version) => {
              const isHead = version.versionNumber === headVersion?.versionNumber;
              const isCrossFormat =
                Boolean(headVersion) && version.contentFormat !== headVersion?.contentFormat;

              return (
                <div
                  key={version.id ?? version.versionNumber}
                  className="rounded-md border border-slate-200 bg-white p-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xs font-semibold text-slate-700">
                      v{version.versionNumber}
                      {` · ${formatLabel(version.contentFormat)}`}
                      {isHead ? " · current" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Name version ${version.versionNumber}`}
                        onClick={() =>
                          setEditing({
                            versionNumber: version.versionNumber,
                            label: version.label ?? "",
                          })
                        }
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </button>
                      <Button
                        size="xs"
                        variant="outline"
                        title={isCrossFormat ? CROSS_FORMAT_RESTORE_REASON : undefined}
                        onClick={() => restoreMutation.mutate(version.versionNumber)}
                        disabled={restoreMutation.isPending || isHead || isCrossFormat}
                      >
                        Restore
                      </Button>
                    </span>
                  </div>
                  {editing?.versionNumber === version.versionNumber ? (
                    <form
                      className="mt-1.5 flex gap-1"
                      onSubmit={(event) => {
                        event.preventDefault();
                        labelMutation.mutate(editing);
                      }}
                    >
                      <input
                        autoFocus
                        aria-label="Checkpoint name"
                        maxLength={100}
                        value={editing.label}
                        placeholder="e.g. Approved by ops"
                        onChange={(event) => setEditing({ ...editing, label: event.target.value })}
                        className="h-6 min-w-0 flex-1 rounded border border-slate-200 px-1.5 text-2xs"
                      />
                      <Button size="xs" type="submit" disabled={labelMutation.isPending}>
                        Save
                      </Button>
                    </form>
                  ) : (
                    version.label && (
                      <p className="mt-1 inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-2xs font-medium text-amber-800">
                        <BookmarkIcon className="h-2.5 w-2.5" />
                        {version.label}
                      </p>
                    )
                  )}
                  <p className="mt-1 line-clamp-2 text-2xs text-muted-foreground">
                    {version.promptText}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </PopoverWrapper>
  );
};
