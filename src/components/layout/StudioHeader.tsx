import { AppLogo } from "@/react-toolkit/components/layout";
import { UnreadNotifications, UserAccountModal } from "@/react-toolkit/features";
import { cn } from "@/react-toolkit/lib";

interface StudioHeaderProps {
  className?: string;
}

const StudioHeader = ({ className }: StudioHeaderProps) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex w-full flex-col justify-center border-none bg-white/95 px-0 backdrop-blur-md",
        className,
      )}
    >
      <div className={cn("flex h-[3rem] w-full items-center md:px-2.5")}>
        <div className="flex flex-grow items-center">
          <AppLogo className="h-7 text-lg" />
        </div>
        <div className="flex items-center gap-4">
          <UnreadNotifications className="mt-0 mlg:mt-4" />
          <UserAccountModal />
        </div>
      </div>
    </header>
  );
};

export { StudioHeader };
