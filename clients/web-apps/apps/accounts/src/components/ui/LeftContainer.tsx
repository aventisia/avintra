import { ThemeSwitcher } from "@avplatform/layout/header";
import { cn } from "@avplatform/ui/lib";

interface LeftContainerProps {
  className?: string;
  children?: React.ReactNode;
}

const LeftContainer = ({ className, children }: LeftContainerProps) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen w-full flex-col items-center justify-between gap-6 px-4 py-6 xs:px-8",
        className,
      )}
    >
      {children}
      <ThemeSwitcher className="absolute right-4 top-6 px-0 xs:right-8" />
    </div>
  );
};

export { LeftContainer };
