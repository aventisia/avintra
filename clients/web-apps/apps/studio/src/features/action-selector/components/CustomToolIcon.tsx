import { cn } from "@avplatform/ui/lib";
import { useState } from "react";

import { iconMapper } from "@/components/icon-mapper";
import { isSafeAssetSrc } from "@/utils/resolve-asset-src.util";

import { DEFAULT_TOOL_ICON_KEY } from "../utils/custom-tool-icon.util";
import { FallbackImageIcon } from "./FallbackImageIcon";

type CustomToolIconProps = {
  /** Icon key (icon-mapper) or brand asset path for the tool. */
  icon?: string;
  /** Optional user-supplied tool icon URL; takes precedence over `icon`. */
  iconUrl?: string;
  className?: string;
};

/**
 * Renders a custom tool's icon with layered fallbacks: user-supplied icon URL, icon-mapper glyph, brand image, then the shared Wrench glyph.
 */
export const CustomToolIcon = ({ icon, iconUrl, className }: CustomToolIconProps) => {
  const [hasImageError, setHasImageError] = useState(false);

  const resolved = icon || DEFAULT_TOOL_ICON_KEY;
  const wrapperClass = cn("flex h-5 w-5 shrink-0 items-center justify-center", className);

  if (isSafeAssetSrc(iconUrl) && !hasImageError) {
    return (
      <div className={wrapperClass}>
        <FallbackImageIcon
          className="h-5 w-5"
          src={iconUrl}
          onError={() => setHasImageError(true)}
        />
      </div>
    );
  }

  if (resolved in iconMapper) {
    return <div className={wrapperClass}>{iconMapper[resolved]}</div>;
  }

  if (icon && !hasImageError) {
    return (
      <div className={wrapperClass}>
        <FallbackImageIcon className="h-5 w-5" src={icon} onError={() => setHasImageError(true)} />
      </div>
    );
  }

  return <div className={wrapperClass}>{iconMapper[DEFAULT_TOOL_ICON_KEY]}</div>;
};
