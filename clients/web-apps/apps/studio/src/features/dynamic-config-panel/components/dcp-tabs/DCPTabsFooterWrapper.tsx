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
        "!mt-0 flex h-16 w-full items-center justify-end border-t px-4",
        className,
      )}
    >
      {children}
    </div>
  );
};
