import { LoadingSpinner } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { useShallow } from "zustand/react/shallow";

import { useAppLoaderStore } from "@/stores/app-loader-store";

import { AppLogo } from "./AppLogo";
import { AppMinimalFooter } from "./AppMinimalFooter";

interface AppLoaderProps {
  className?: string;
}

const AppLoader = ({ className }: AppLoaderProps) => {
  const { message } = useAppLoaderStore(useShallow((state) => ({ message: state.message })));
  return (
    <div
      className={cn(
        "flex h-screen w-full flex-col items-center justify-between p-3 pb-3 lg:w-[100%]",
        className,
      )}
    >
      <div className="flex w-full items-center justify-between p-5 xs:p-6">
        <AppLogo showFullLogo />
      </div>
      <div className="text-md -mt-4 flex items-center gap-3">
        <LoadingSpinner className="h-10 w-10 text-primary" />
        {message}
      </div>
      <AppMinimalFooter />
    </div>
  );
};

export { AppLoader };
