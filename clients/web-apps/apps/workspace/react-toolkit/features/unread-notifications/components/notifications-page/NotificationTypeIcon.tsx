import { NotificationTypesEnum } from "@avplatform/ui/enums";
import { cn } from "@avplatform/ui/lib";
import { BellIcon, BellRingIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";

const TYPE_STYLES = {
  [NotificationTypesEnum.Information]: {
    Icon: InfoIcon,
    className: "bg-selected text-primary-text",
  },
  [NotificationTypesEnum.Warning]: { Icon: TriangleAlertIcon, className: "bg-warn/10 text-warn" },
  [NotificationTypesEnum.Alert]: { Icon: BellRingIcon, className: "bg-bad/10 text-bad" },
} as Record<string, { Icon: typeof BellIcon; className: string }>;

const FALLBACK_STYLE = { Icon: BellIcon, className: "bg-sunken text-ink-2" };

export const NotificationTypeIcon = ({ type }: { type: string }) => {
  const { Icon, className } = TYPE_STYLES[type] ?? FALLBACK_STYLE;
  return (
    <span
      aria-hidden="true"
      className={cn("grid size-8 shrink-0 place-items-center rounded-md", className)}
    >
      <Icon className="size-4" />
    </span>
  );
};
