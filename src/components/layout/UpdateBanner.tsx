import { Button } from "@aventisia/ui/buttons";
import { Banner } from "@aventisia/ui/layout";
import { MonitorCogIcon, RotateCcwIcon } from "lucide-react";

export function UpdateBanner() {
  return (
    <Banner isClosable={false}>
      <div className="flex w-full gap-2 md:items-center">
        <div className="flex grow gap-3 md:items-center md:justify-center">
          <MonitorCogIcon
            className="shrink-0 text-secondary-foreground opacity-80 max-md:mt-0.5"
            size={18}
            strokeWidth={2}
            aria-hidden="true"
          />
          <p className="flex items-center justify-center gap-3 text-sm text-secondary-foreground">
            The latest update has been installed. Please restart the app to
            apply the new features.
            <Button size="xs" className="gap-2">
              <RotateCcwIcon size={14} strokeWidth={2} />
              Restart Now
            </Button>
          </p>
        </div>
      </div>
    </Banner>
  );
}
