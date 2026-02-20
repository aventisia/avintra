import { Separator } from "@/app/_components/ui";
import { Avatar, AvatarFallback } from "@/app/_components/ui/avatar";
import { Badge } from "@/app/_components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/cards";
import { BotIcon, Copy, FileBoxIcon, Tag } from "lucide-react";

import { WorcTemplatesDto } from "../dtos/worc-templates-dtos";
import { useViewTemplate } from "../hooks/useViewTemplate";

type TemplateCardProps = {
  template: WorcTemplatesDto;
};

/**
 * TemplateCard
 *
 * Reusable component to visually display a Worc template.
 * Shows name, description, icons, usage count, and creator info.
 */
export const TemplateCard = ({ template }: TemplateCardProps) => {
  const handleViewTemplate = useViewTemplate();

  const filteredIcons = template.icons?.filter(
    (icon) => icon !== "/function.png"
  );

  return (
    <Card
      key={template.id}
      className="cursor-pointer rounded-2xl border-primary-50 shadow-none transition-all hover:border-primary-200 dark:hover:border-primary-700 w-full flex flex-col justify-between"
      onClick={() => handleViewTemplate(template.id)}>
      <CardHeader className="pb-3 sm:pb-4">
        {/* Icon area */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {filteredIcons?.length ? (
            <>
              {filteredIcons?.slice(0, 4)?.map((icon, idx) => (
                <div
                  key={icon || idx}
                  className=" rounded-lg bg-accent p-1.5 sm:p-2">
                  <img
                    src={icon}
                    alt="icon"
                    className="h-5 w-5 sm:h-6 sm:w-6 !border-0"
                  />
                </div>
              ))}

              {filteredIcons?.length > 5 && (
                <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center  rounded-lg bg-accent p-1.5 sm:p-2">
                  <span className="text-xs sm:text-sm font-medium dark:text-black">
                    +{filteredIcons.length - 4}
                  </span>
                </div>
              )}

              {filteredIcons?.length == 5 && (
                <div className=" rounded-lg bg-accent p-1.5 sm:p-2">
                  <img
                    src={filteredIcons[4]}
                    alt="icon"
                    className="h-5 w-5 sm:h-6 sm:w-6 !border-0"
                  />
                </div>
              )}
            </>
          ) : (
            // Fallback icon
            <div className="rounded-lg bg-accent p-1.5 sm:p-2">
              {template.type == "AIProject" ? (
                <FileBoxIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <BotIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <div>
        <CardContent className="mt-2 pb-1">
          {/* Template title */}
          <CardTitle
            title={template.name}
            className="truncate text-sm sm:text-[0.9rem] font-semibold capitalize">
            {template.name}
          </CardTitle>
          {/* Type badge */}
          <Badge
            variant="outline"
            className="mt-2 flex w-fit border-border text-xs items-center gap-1 bg-slate-100 dark:bg-background py-0.5 sm:py-1 px-2">
            <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="leading-3">
              {template.type?.replace("AIProject", "AI Model")}
            </span>
          </Badge>
        </CardContent>

        <Separator className="mx-3 sm:mx-4 mb-2 sm:mb-3 mt-2 sm:mt-2.5 h-[0.5px] w-auto" />

        <CardFooter className="flex items-center justify-between !pb-3 sm:!pb-4 gap-2">
          {/* Creator badge and name */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <Avatar className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center flex-shrink-0">
              <AvatarFallback className="flex items-center justify-center border border-primary-100 bg-accent text-xs  font-medium">
                {template?.createdBy
                  ? template?.createdBy
                    ?.split(" ")
                    .map((word) => word[0])
                    .join("")
                  : "--"}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs leading-5 sm:leading-7 text-accent-foreground truncate">
              {template.createdBy}
            </p>
          </div>

          {/* Usage count with clipboard copy button */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
            <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <p>{template.usagesCount}</p>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
};
