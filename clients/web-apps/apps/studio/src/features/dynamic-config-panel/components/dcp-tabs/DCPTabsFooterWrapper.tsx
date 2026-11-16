import { cn } from "@avplatform/ui/lib";

export const DCPTabsFooterWrapper = ({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "!mt-0 flex h-14 w-full shrink-0 items-center justify-end gap-2 border-t border-line px-4",
        className,
      )}
    >
      {children}
    </div>
  );
};
