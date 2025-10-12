import { DotSeparator, LoadingSpinner, Separator } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";
import { Button } from "@aventisia/ui/buttons";
import { dateFormatter } from "@aventisia/ui/utils";
import { Clock, Download, Tag, User2 } from "lucide-react";

import { UseTemplateDTO } from "../../dtos/use-template-dto";
import { useAgentTemplateMutation } from "../../hooks/useAgentTemplateMutation";
import { useModelTemplateMutation } from "../../hooks/useModelTemplateMutation";

export function TemplateHeader({ template }: { template: UseTemplateDTO }) {
  // Initialize mutations for model and agent templates
  const { mutateAsync: modelMutation, isPending: isPendingModel } =
    useModelTemplateMutation();
  const { mutateAsync: agentMutation, isPending: isPendingAgent } =
    useAgentTemplateMutation();

  // Determine type of template
  const isModelTemplate = template?.type === "Inferencing";
  const isAgentTemplate = ["Agent", "Block"].includes(template?.type || "");

  // Track loading state based on active mutation
  const isPending = isModelTemplate
    ? isPendingModel
    : isAgentTemplate
      ? isPendingAgent
      : false;

  // Handles the action to apply the selected template
  const handleUseTemplate = async () => {
    try {
      if (isModelTemplate) {
        await modelMutation(template);
      } else if (isAgentTemplate) {
        await agentMutation(template);
      }
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
            <h1 className="text-4xl font-semibold tracking-tight">
              {template.name}
            </h1>

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
                <span className="leading-4">
                  Updated on{" "}
                  {dateFormatter(template?.lastModifiedOn || new Date())}
                </span>
              </div>

              <DotSeparator />

              {/* Created by */}
              <div className="flex items-center gap-1">
                <User2 className="h-4 w-4" />
                <span className="leading-4">
                  {template.createdBy || "Unknown"}
                </span>
              </div>
            </div>

            {/* Type and Tags */}
            <div className="flex flex-row flex-wrap items-center gap-2">
              {/* Type Badge */}
              <Badge className="flex items-center gap-1 capitalize">
                {template.type}
              </Badge>

              {/* Tags */}
              {template?.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="flex items-center gap-1 bg-slate-100"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Right side: Button */}
          <Button
            id="get-started"
            className="flex items-center gap-2"
            disabled={template.status !== "Approved" || isPending}
            onClick={handleUseTemplate}
          >
            {isPending && <LoadingSpinner className="h-4 w-4 animate-spin" />}
            {isPending ? "Cloning..." : "Clone this template"}
          </Button>
        </div>

        {/* Separator */}
        <Separator className="mt-6" />
      </div>
    </>
  );
}
