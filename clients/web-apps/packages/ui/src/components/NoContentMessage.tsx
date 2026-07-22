import { cn } from "@/ui/lib";
import { type IconProps } from "@/ui/types";

interface NoContentMessageProps {
  /** (Optional): To show relevant icon if there is no content*/
  Icon?: React.ComponentType<IconProps>;

  /** Primary message to show when content is empty */
  primaryMessage: string;

  /** (Optional): secondary message to show under primary message when content is emtpy */
  secondaryMessage?: string;

  /** (Optiona): Action (JSX) to take when content is empty. Mostly a create button to start create a content */
  action?: React.ReactNode;

  /** (Optional): To pass css classes to override NoContentMessage container style */
  className?: string;
}

/** Use this component when no content/result found. Mostly used when data
 * is dynamic (fetching from database) or conditon based data to be shown then
 * data can be null or empty and this component can be rendered
 */
const NoContentMessage = ({
  Icon,
  primaryMessage,
  secondaryMessage,
  action,
  className,
}: NoContentMessageProps) => {
  return (
    <div className={cn("flex h-full w-full flex-col items-center justify-center", className)}>
      {/* (Optional): Relevant icon or image of no content */}
      {Icon && <Icon className="mb-4 h-10 w-10 stroke-1 text-muted-foreground" />}
      {/* Primary message (Required) */}
      <p className="text-sm font-medium">{primaryMessage}</p>
      {/* (Optional): Secondary message */}
      <p className="mt-1 w-[80%] text-center text-2xs text-muted-foreground">{secondaryMessage}</p>
      {/* (Optional): Action JSX */}
      {action}
    </div>
  );
};

export { NoContentMessage, type NoContentMessageProps };
