import { Badge } from "@aventisia/ui/badge";
import { cn } from "@aventisia/ui/lib";
import { IconProps } from "@aventisia/ui/types";
import type { ComponentProps, ComponentType } from "react";

/**
 * Props for the {@link ViewBadge} component.
 *
 * Extends all {@link Badge} props (excluding `children`) so standard badge
 * attributes can be forwarded to the underlying badge element.
 */
type ViewBadgeProps = Omit<ComponentProps<typeof Badge>, "children"> & {
  /** Text displayed inside the badge and used as the default title. */
  text: string;
  /** Optional view style for the badge. */
  viewStyle?: "default" | "enabled" | "disabled";
  /** Optional icon rendered before the badge text. */
  Icon?: ComponentType<IconProps>;
  /** Additional classes for the optional icon. */
  iconClassName?: string;
};

/**
 * Renders a compact read-only badge for record metadata such as environment,
 * operating system, or status.
 *
 * @example
 * <ViewBadge Icon={HardDriveIcon} text="Production" />
 * <ViewBadge text="Enabled" className="border-primary-100 bg-primary-50 text-primary-500" />
 */
export const ViewBadge = ({
  text,
  viewStyle,
  Icon,
  className,
  iconClassName,
  title,
  variant = "outline",
  ...props
}: ViewBadgeProps) => {
  return (
    <Badge
      variant={variant}
      title={title ?? text}
      className={cn(
        "flex items-center max-w-[16rem] gap-1.5 border-slate-300 px-[0.55rem] py-[0.23rem]",
        viewStyle === "enabled" && "border-primary-100 bg-primary-50 text-primary-500",
        viewStyle === "disabled" && "border-red-200 bg-red-100 text-red-500",
        className,
      )}
      {...props}
    >
      {Icon && (
        <Icon
          className={cn(
            "size-3.5 stroke-[2px] text-muted-foreground",
            viewStyle === "enabled" && "text-primary-500",
            viewStyle === "disabled" && "text-red-500",
            iconClassName,
          )}
        />
      )}
      <span className="truncate">{text}</span>
    </Badge>
  );
};
