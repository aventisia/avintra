import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";

import {
  SEGMENTED_TABS_LIST_CLASS,
  SEGMENTED_TABS_TRIGGER_CLASS,
} from "@/components/segmented-tabs.constant";

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
      <TabsList aria-label="Operating system" className={SEGMENTED_TABS_LIST_CLASS}>
        {PLATFORMS.map((platform) => (
          <TabsTrigger key={platform} value={platform} className={SEGMENTED_TABS_TRIGGER_CLASS}>
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
