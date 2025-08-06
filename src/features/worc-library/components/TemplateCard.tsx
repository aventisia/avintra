import { Separator } from "@aventisia/ui";
import { Avatar, AvatarFallback } from "@aventisia/ui/avatar";
import { Badge } from "@aventisia/ui/badge";
import { Button } from "@aventisia/ui/buttons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aventisia/ui/cards";
import { BotIcon, Copy } from "lucide-react";

import { WorcTemplatesDto } from "../dtos/worc-templates-dtos";

type TemplateCardProps = {
  template: WorcTemplatesDto;
  onClick: (template: WorcTemplatesDto) => void;
};

/**
 * TemplateCard
 *
 * Reusable component to visually display a Worc template.
 * Shows name, description, icons, usage count, and creator info.
 */
export const TemplateCard = ({ template, onClick }: TemplateCardProps) => {
  return (
    <Card
      key={template.id}
      className="cursor-pointer rounded-3xl border-primary-100 shadow-none hover:shadow-md"
      onClick={() => onClick(template)}
    >
      <CardHeader className="pb-4">
        {/* Icon area */}
        <div className="flex items-center gap-4">
          {template.icons?.length ? (
            template.icons.map((icon, idx) => (
              <div key={icon || idx} className="rounded-lg bg-accent p-2">
                <img src={icon} alt="icon" className="h-6 w-6" />
              </div>
            ))
          ) : (
            // Fallback icon
            <div className="rounded-lg bg-accent p-2">
              <BotIcon className="h-6 w-6" />
            </div>
          )}
        </div>

        {/* Template title */}
        <CardTitle className="!mt-5 text-base font-semibold capitalize">
          {template.name}
        </CardTitle>

        {/* Template description (fallback if empty) */}
        <CardDescription className="line-clamp-4 min-h-[5rem] text-muted-foreground">
          {template.description || "No description available"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pb-1">
        {/* Type badge */}
        <Badge className="border-primary text-primary" variant="outline">
          {template.type}
        </Badge>
        <Separator />
      </CardContent>

      <CardFooter className="flex items-center justify-between !pb-3.5">
        {/* Creator badge and name */}
        <div className="flex items-center gap-2">
          <Avatar className="flex h-7 w-7 items-center justify-center">
            <AvatarFallback className="bg-[#aba7e7] text-xs font-medium capitalize leading-7 tracking-wider text-secondary">
              {template?.createdBy
                ? template?.createdBy
                    ?.split(" ")
                    .map((word) => word[0])
                    .join("")
                : "--"}
            </AvatarFallback>
          </Avatar>
          <p className="text-xs leading-7 text-accent-foreground">
            {template.createdBy}
          </p>
        </div>

        {/* Usage count with clipboard copy button */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Button
            variant="ghost"
            className="p-0 px-2"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              navigator.clipboard.writeText(`${template.usagesCount}`);
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <p>{template.usagesCount}</p>
        </div>
      </CardFooter>
    </Card>
  );
};
