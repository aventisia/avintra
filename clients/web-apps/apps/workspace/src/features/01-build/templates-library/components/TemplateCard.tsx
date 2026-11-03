import { Separator } from "@avplatform/ui";
import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import { Badge } from "@avplatform/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@avplatform/ui/cards";
import { CopyIcon, TagIcon } from "@phosphor-icons/react";

import NewAgentIcon from "@/components/NewAgentIcon";

import { AvPlatformTemplatesDto } from "../dtos/avplatform-templates-dtos";
import { useViewTemplate } from "../hooks/useViewTemplate";
import { transformTemplateType } from "../utils/transform-template-type";

type TemplateCardProps = {
  template: AvPlatformTemplatesDto;
};

/**
 * TemplateCard
 *
 * Reusable component to visually display a avplatform template.
 * Shows name, description, icons, usage count, and creator info.
 */
export const TemplateCard = ({ template }: TemplateCardProps) => {
  const handleViewTemplate = useViewTemplate();

  const templateIcons = template?.icons?.filter((icon) => icon !== "/function.png");
  const basePath = import.meta.env.VITE_WORKSPACE_PATH;

  return (
    <Card
      key={template.id}
      className="flex cursor-pointer flex-col justify-between rounded-lg border-line shadow-none transition-colors hover:border-line-strong hover:bg-hover"
      onClick={() => handleViewTemplate(template.id)}
    >
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          {templateIcons?.length ? (
            <>
              {templateIcons.slice(0, 4).map((icon, idx) => (
                <div key={icon || idx} className="rounded-lg bg-accent p-1.5 md:p-2">
                  <img src={basePath + icon} alt="icon" className="h-6 w-6" />
                </div>
              ))}

              {templateIcons.length > 5 && (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent p-1.5 md:p-2">
                  <span className="text-sm font-medium">+{templateIcons.length - 4}</span>
                </div>
              )}

              {templateIcons.length === 5 && (
                <div className="rounded-lg bg-accent p-1.5 md:p-2">
                  <img src={basePath + templateIcons[4]} alt="icon" className="h-6 w-6" />
                </div>
              )}
            </>
          ) : (
            // Fallback icon
            <div className="rounded-lg bg-accent p-1.5 md:p-2">
              <NewAgentIcon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardHeader>
      <div>
        <CardContent className="space-y-3 pb-1">
          {/* Template title */}
          <CardTitle
            title={template.name}
            className="truncate text-[0.9rem] font-semibold capitalize"
          >
            {template.name}
          </CardTitle>
          {/* Type badge */}
          <Badge variant="outline" className="flex w-fit items-center gap-1 bg-sunken py-1">
            <TagIcon className="h-3 w-3" />
            <span className="leading-3">{transformTemplateType(template?.type)}</span>
          </Badge>
        </CardContent>
        <Separator className="mx-4 mb-3 mt-2.5 h-[0.5px] w-auto" />

        <CardFooter className="flex items-center justify-between !pb-4">
          {/* Creator badge and name */}
          <div className="flex items-center gap-2">
            <Avatar className="flex h-7 w-7 items-center justify-center">
              <AvatarFallback className="flex items-center justify-center border border-line bg-accent text-2xs font-medium">
                {template?.createdBy
                  ? template?.createdBy
                      ?.split(" ")
                      .map((word) => word[0])
                      .join("")
                  : "--"}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs leading-7 text-accent-foreground">{template.createdBy}</p>
          </div>

          {/* Usage count with clipboard copy button */}
          {template.type !== "Prompt" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CopyIcon className="h-4 w-4" />
              <p>{template.usagesCount}</p>
            </div>
          )}
        </CardFooter>
      </div>
    </Card>
  );
};
