import { Button, buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import {
  PopoverContent,
  PopoverDefaultHeader,
  PopoverTrigger,
  PopoverWrapper,
} from "@avplatform/ui/popover";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ChevronDownIcon, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useRestoreUiBuilderVersion } from "../hooks/useRestoreUiBuilderVersion.hook";
import { useUiBuilderProject } from "../hooks/useUiBuilderProject.hook";
import { useUiBuilderVersionsStore } from "../stores/ui-builder-versions.store";

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
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ChevronDownIcon className="h-3 w-3 shrink-0 transition-all group-hover:mt-0.5" />
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

              return (
                <div
                  key={version.id ?? version.versionNumber}
                  className="rounded-md border border-slate-200 bg-white p-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xs font-semibold text-slate-700">
                      v{version.versionNumber}
                      {isHead ? " · current" : ""}
                    </span>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => restoreMutation.mutate(version.versionNumber)}
                      disabled={restoreMutation.isPending || isHead}
                    >
                      Restore
                    </Button>
                  </div>
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
