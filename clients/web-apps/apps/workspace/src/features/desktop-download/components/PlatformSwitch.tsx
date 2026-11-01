import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";

import { PLATFORMS, PLATFORM_LABELS } from "../constants/desktop-download.constant";
import type { Platform } from "../utils/detect-platform.util";
import { PlatformIcon } from "./PlatformIcon";

type PlatformSwitchProps = {
  value: Platform;
  detected: Platform;
  onChange: (platform: Platform) => void;
};

export const PlatformSwitch = ({ value, detected, onChange }: PlatformSwitchProps) => (
  <div className="flex flex-col items-start gap-1.5 sm:items-end">
    <Tabs value={value} onValueChange={(platform) => onChange(platform as Platform)}>
      <TabsList aria-label="Operating system" className="h-9 gap-0 rounded-lg border-0 bg-sunken">
        {PLATFORMS.map((platform) => (
          <TabsTrigger
            key={platform}
            value={platform}
            className="h-full rounded-lg border border-transparent px-3 font-normal text-ink data-[state=active]:border-line/60 data-[state=active]:bg-surface dark:data-[state=active]:bg-fill data-[state=active]:after:hidden"
          >
            <PlatformIcon platform={platform} className="size-3.5" />
            {PLATFORM_LABELS[platform]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
    <span className="text-hint text-muted-foreground">
      This device looks like {PLATFORM_LABELS[detected]}
    </span>
  </div>
);
