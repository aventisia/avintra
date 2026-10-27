import { Badge } from "@avplatform/ui/badge";
import { cn } from "@avplatform/ui/lib";
import { type IconProps } from "@avplatform/ui/types";
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
 * <ViewBadge text="Enabled" className="border-primary-text/35 text-primary-text" />
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
        "flex max-w-[16rem] items-center gap-1.5",
        viewStyle === "enabled" && "border-primary-text/35 text-primary-text",
        viewStyle === "disabled" && "border-bad/35 text-bad",
        className,
      )}
      {...props}
    >
      {Icon && (
        <Icon
          className={cn(
            "size-3 min-h-3 min-w-3 stroke-[2px] text-current",
            viewStyle === "enabled" && "text-primary-text",
            viewStyle === "disabled" && "text-bad",
            iconClassName,
          )}
        />
      )}
      <span className="truncate">{text}</span>
    </Badge>
  );
};
