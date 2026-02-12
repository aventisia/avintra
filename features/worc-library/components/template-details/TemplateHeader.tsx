"use client";
import { DotSeparator, Separator } from "@/app/_components/ui";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/buttons";
import { Clock, Download, Tag, User2 } from "lucide-react";

import { UseTemplateDTO } from "../../dtos/use-template-dto";
import { dateFormatter } from "@/utils";
import { useCloneTemplate } from "../../hooks/useCloneTemplate";

export function TemplateHeader({ template }: { template: UseTemplateDTO }) {
  const handleCloneTemplate = useCloneTemplate();

  return (
    <>
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          {/* Left side */}
          <div className="flex flex-col gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Template Name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight break-words">
              {template.name}
            </h1>

            {/* Metadata: uses, last updated, creator */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-1 text-xs sm:text-sm text-muted-foreground">
              {/* Usage count */}
              <div className="flex items-center gap-1">
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="leading-4">
                  {template?.usageCount?.toLocaleString() ?? 0} uses
                </span>
              </div>

              <DotSeparator className="hidden sm:block" />

              {/* Last updated */}
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="leading-4 break-words">
                  Updated on{" "}
                  {dateFormatter(template?.lastModifiedOn || new Date())}
                </span>
              </div>

              <DotSeparator className="hidden sm:block" />

              {/* Created by */}
              <div className="flex items-center gap-1 min-w-0">
                <User2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="leading-4 capitalize truncate">
                  {template.createdBy || "Unknown"}
                </span>
              </div>
            </div>

            {/* Type and Tags */}
            <div className="flex flex-row flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Type Badge */}
              <Badge className="flex text-2xs sm:text-xs items-center gap-1 capitalize">
                {template?.type?.replace("AIProject", "AI Model")}
              </Badge>

              {/* Tags */}
              {template?.tags
                ?.filter(
                  (tag) => tag.toLowerCase() !== template?.type?.toLowerCase()
                ) //Filter tags that are similar to project type?
                .map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="flex text-2xs sm:text-xs border-border capitalize items-center gap-1 bg-slate-100 dark:bg-background">
                    <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {tag}
                  </Badge>
                ))}
            </div>
          </div>

          {/* Right side: Button */}
          <Button
            id="get-started"
            className="flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base whitespace-nowrap flex-shrink-0"
            onClick={() => handleCloneTemplate(template.id)}>
            Clone this template
          </Button>
        </div>

        {/* Separator */}
        <Separator className="mt-4 sm:mt-6" />
      </div>
    </>
  );
}
