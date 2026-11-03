import { AppleLogoIcon, LinuxLogoIcon, WindowsLogoIcon } from "@phosphor-icons/react";

import type { Platform } from "../utils/detect-platform.util";

const PLATFORM_ICONS = { windows: WindowsLogoIcon, macos: AppleLogoIcon, linux: LinuxLogoIcon };

export const PlatformIcon = ({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) => {
  const Icon = PLATFORM_ICONS[platform];
  return <Icon className={className} aria-hidden="true" />;
};
