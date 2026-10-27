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
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="mb-3 grid size-8 place-items-center rounded-md border border-line bg-sunken text-ink-2">
          <Icon className="size-4" />
        </div>
      )}
      <p className="text-[16px]/5 font-semibold tracking-[-0.01em] text-ink">{primaryMessage}</p>
      {secondaryMessage && (
        <p className="max-w-[380px] text-body-sm text-muted-foreground">{secondaryMessage}</p>
      )}
      {action && <div className="mt-3 flex gap-2">{action}</div>}
    </div>
  );
};

export { NoContentMessage, type NoContentMessageProps };
