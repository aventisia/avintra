import { FaApple, FaWindows } from "react-icons/fa";
import { SiLinux } from "react-icons/si";

import type { Platform } from "../utils/detect-platform.util";

const PLATFORM_ICONS = { windows: FaWindows, macos: FaApple, linux: SiLinux };

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
