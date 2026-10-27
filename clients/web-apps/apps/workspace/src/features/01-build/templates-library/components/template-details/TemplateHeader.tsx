import { DotSeparator, LoadingSpinner, Separator } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { formatDate } from "@avplatform/ui/utils";
import { Clock, Download, Tag, User2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { UseTemplateDTO } from "../../dtos/use-template-dto";
import { useCloneTemplateMutation } from "../../hooks/useCloneTemplateMutation";
import { transformTemplateType } from "../../utils/transform-template-type";
import { DeleteTemplateButton } from "./DeleteTemplateButton";

export function TemplateHeader({ template }: { template: UseTemplateDTO }) {
  useDocumentTitle(`${template.name} - Library`);

  const { mutateAsync: cloneTemplateMutation, isPending } = useCloneTemplateMutation();

  // Access the current user session from the store
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const isSA = userSession?.userRoles.includes("SA");
  const isTA = userSession?.userRoles.includes("TA");

  const canDeleteTemplate =
    (isSA && template?.accessType === "Public") || (isTA && template?.accessType === "TenantLevel");

  // Handles the action to apply the selected template
  const handleUseTemplate = async () => {
    try {
      await cloneTemplateMutation(template);
    } catch (error) {
      // Mutation error is already handled by hooks
      console.log(error);
    }
  };

  return (
    <>
      <div>
        <div className="flex flex-row items-center justify-between gap-6">
          {/* Left side */}
          <div className="flex flex-col gap-4">
            {/* Template Name */}
            <h1 className="text-title text-ink">{template.name}</h1>

            {/* Metadata: uses, last updated, creator */}
            <div className="flex flex-row items-center gap-1 text-sm text-muted-foreground">
              {/* Usage count */}
              <div className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span className="leading-4">
                  {template?.usageCount?.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  uses
                </span>
              </div>

              <DotSeparator />

              {/* Last updated */}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="leading-4">Updated on {formatDate(template?.lastModifiedOn)}</span>
              </div>

              <DotSeparator />

              {/* Created by */}
              <div className="flex items-center gap-1">
                <User2 className="h-4 w-4" />
                <span className="leading-4">{template.createdBy || "Unknown"}</span>
              </div>
            </div>

            {/* Type and Tags */}
            <div className="flex flex-row flex-wrap items-center gap-2">
              {/* Type Badge */}
              <Badge className="flex items-center gap-1 capitalize">
                {transformTemplateType(template?.type)}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 bg-sunken">
                <Tag className="h-3 w-3" />

                {template?.accessType == "Public" ? "Public" : "Tenant"}
              </Badge>

              {/* Tags */}
              {template?.tags
                ?.filter((tag) => tag.toLowerCase() !== template?.type?.toLowerCase()) //Filter tags that are similar to project type
                ?.map((tag) => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1 bg-sunken">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
            </div>
          </div>

          {/* Right side: Button */}

          <div className="flex items-center gap-3">
            {template.type !== "Prompt" && (
              <Button
                id="get-started"
                className="flex items-center gap-2"
                disabled={template.status !== "Approved" || isPending}
                onClick={handleUseTemplate}
              >
                {isPending && <LoadingSpinner className="h-4 w-4 animate-spin" />}
                {isPending ? "Cloning..." : "Clone this template"}
              </Button>
            )}
            {canDeleteTemplate && <DeleteTemplateButton id={template.id} />}
          </div>
        </div>

        {/* Separator */}
        <Separator className="mt-6" />
      </div>
    </>
  );
}
