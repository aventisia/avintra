import { cn } from "@avplatform/ui/lib";

interface ContentContainerProps {
  children?: React.ReactNode;
  className?: string;
}

const ContentContainer = ({ children, className = "" }: ContentContainerProps) => {
  return (
    <div className={cn("relative w-full max-w-[440px]", className)}>
      <div className="flex w-full flex-col items-start justify-center space-y-6">{children}</div>
    </div>
  );
};

export { ContentContainer };
