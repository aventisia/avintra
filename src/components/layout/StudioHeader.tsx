import { ETLIAMenu } from "@/features/etlia-menu/components/ETLIAMenu";
import { StudioPreferences } from "@/features/studio-preferences/components";
import { FlowsPopover } from "@/features/flows-popover/components/FlowsPopover";
import { UnreadNotifications } from "@/react-toolkit/features/unread-notifications/components/unread-notifications";
import { UserAccountModal } from "@/react-toolkit/features/user-account/UserAccountModal";
import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { cn } from "@/react-toolkit/lib/utils";
import { DotSeparator } from "@/react-toolkit/ui/custom/DotSeparator";

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
          <DotSeparator className="ml-[0.9rem] mr-[0.9rem]" />
          <ETLIAMenu />
        </div>
        <div className="flex items-center gap-4">
          <FlowsPopover className="mt-0 mlg:mt-4" />
          <div className="flex gap-1">
            <StudioPreferences />
            <UnreadNotifications className="mt-0 mlg:mt-4" />
          </div>
          <UserAccountModal />
        </div>
      </div>
    </header>
  );
};

export { StudioHeader };
