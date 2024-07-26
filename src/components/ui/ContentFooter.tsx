import { cn } from "@/react-toolkit/lib/utils";

interface ContentFooterProps {
  children?: React.ReactNode;
  className?: string;
}
const ContentFooter = ({ children, className }: ContentFooterProps) => {
  return (
    <div
      className={cn(
        "!mt-7 flex w-full items-center justify-center gap-1 text-center text-sm text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
};

export { ContentFooter };
