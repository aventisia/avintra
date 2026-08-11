import { NotificationTypesEnum } from "@avplatform/ui/enums";
import { cn } from "@avplatform/ui/lib";
import {
  BellAlertIcon,
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface UNTypeIconProps {
  /** The notification type used to pick the icon. */
  type?: string;

  /** Additional class name to override the icon container style. */
  className?: string;
}

/**
 * Renders an icon based on the notification type.
 * - Information → info circle
 * - Warning → warning triangle
 * - Alert → bell alert
 * - Reminder → bell
 * - Fallback → bell
 */
export const UNTypeIcon = ({ type, className }: UNTypeIconProps) => {
  const Icon =
    type === NotificationTypesEnum.Information
      ? InformationCircleIcon
      : type === NotificationTypesEnum.Warning
        ? ExclamationTriangleIcon
        : type === NotificationTypesEnum.Alert
          ? BellAlertIcon
          : BellIcon;

  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
        className,
      )}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
};
