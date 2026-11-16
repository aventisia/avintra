import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Dialog, DialogContent } from "@avplatform/ui/dialog";
import { Tooltip } from "@avplatform/ui/tooltip";
import { RocketLaunchIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { usePublishUiBuilder } from "../hooks/usePublishUiBuilder.hook";
import { useUiBuilderProject } from "../hooks/useUiBuilderProject.hook";
import { useUiBuilderVersionsStore } from "../stores/ui-builder-versions.store";

const OWNER_ACCESS_LEVEL = "Owner";

/** Header publish control for the custom UI builder: owner-only version-pinned publish. */
export const UiBuilderPublishButton = () => {
  const projectId = useUiBuilderVersionsStore((state) => state.projectId);
  const { projectQuery, versionsQuery } = useUiBuilderProject(projectId);
  const { publishMutation } = usePublishUiBuilder(projectId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const project = projectQuery.data?.data;
  const isPublished = Boolean(project?.isPublished);
  const headVersionNumber = project?.headVersionNumber ?? 0;
  const publishedVersionNumber = project?.publishedVersionNumber ?? null;
  const isUpToDate =
    isPublished && publishedVersionNumber !== null && publishedVersionNumber === headVersionNumber;
  const canRePublish =
    isPublished && publishedVersionNumber !== null && publishedVersionNumber !== headVersionNumber;
  const hasNoVersions = (versionsQuery.data?.data?.length ?? 0) === 0;
  const isDisabled =
    !projectId ||
    projectQuery.isLoading ||
    versionsQuery.isLoading ||
    publishMutation.isPending ||
    isUpToDate ||
    hasNoVersions;

  if (project && project.accessLevel !== OWNER_ACCESS_LEVEL) {
    return null;
  }

  const tooltipContent = isUpToDate
    ? "Published"
    : canRePublish
      ? `Publish v${headVersionNumber} (assignees see v${publishedVersionNumber})`
      : "Publish";

  const handlePublish = () => {
    publishMutation.mutate(undefined, {
      onSettled: () => setIsDialogOpen(false),
    });
  };

  return (
    <>
      <Tooltip content={tooltipContent}>
        <Button
          variant="default"
          size="sm"
          disabled={isDisabled}
          className="items-center justify-start gap-2"
          onClick={() => setIsDialogOpen(true)}
        >
          <RocketLaunchIcon className="h-4 w-4 shrink-0" />
          <span className="text-sm font-bold">{isUpToDate ? "Published" : "Publish"}</span>
        </Button>
      </Tooltip>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="space-y-6 p-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Publish {project?.name}?</h2>
            <p className="text-sm text-muted-foreground">
              {canRePublish
                ? `Assignees currently see v${publishedVersionNumber}. Publishing will update Assist → User Interfaces to v${headVersionNumber}.`
                : `This will publish v${headVersionNumber} of ${project?.name} to Assist → User Interfaces.`}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={publishMutation.isPending || !projectId} onClick={handlePublish}>
              {publishMutation.isPending && <LoadingSpinner className="mr-2 h-4 w-4" />}
              Publish
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
