import { Badge } from "@avplatform/ui/badge";
import { cn } from "@avplatform/ui/lib";
import { BrowserIcon, TagIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { UI_TYPE_LABEL } from "../constants";
import { MyInterfaceDto } from "../dtos/my-interface-dto";

type InterfaceListItemProps = {
  uiInterface: MyInterfaceDto;
  isSelected: boolean;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
};

/**
 * Row representation of a published UI builder project assigned to the current user.
 */
export const InterfaceListItem = ({
  uiInterface,
  isSelected,
  onKeyDown,
}: InterfaceListItemProps) => {
  const navigate = useNavigate();

  const handleBodyClick = () => {
    navigate(`/assist/user-interfaces/${uiInterface.id}`);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") handleBodyClick();
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={(event) => {
        handleKeyPress(event);
        onKeyDown(event);
      }}
      onClick={handleBodyClick}
      className={cn(
        "group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 text-left outline-none transition-colors focus-visible:bg-accent",
        isSelected ? "bg-accent" : "hover:bg-accent",
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-50 to-accent text-primary ring-1 ring-primary-100">
        <BrowserIcon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "truncate text-sm font-semibold capitalize",
              isSelected ? "text-primary" : "text-gray-800",
            )}
            title={uiInterface.name}
          >
            {uiInterface.name}
          </p>
          <Badge className="shrink-0 rounded-full bg-slate-200 px-2 py-0 text-2xs font-medium text-secondary">
            v{uiInterface.publishedVersionNumber ?? 0}
          </Badge>
          {uiInterface.isPublishedTenantWide && (
            <span className="shrink-0 truncate rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0 text-2xs font-medium text-emerald-700">
              All team members
            </span>
          )}
        </div>
        {uiInterface.description && (
          <p className="mt-0.5 line-clamp-1 pr-2 text-xs text-muted-foreground">
            {uiInterface.description}
          </p>
        )}
      </div>

      <Badge
        variant="outline"
        className="shrink-0 gap-1 rounded-full border-primary-100 bg-primary-50 py-0.5 text-primary"
      >
        <TagIcon className="h-3 w-3" />
        <span className="leading-3">{uiInterface.type ?? UI_TYPE_LABEL}</span>
      </Badge>
    </div>
  );
};
