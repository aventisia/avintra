import { cn } from "@avplatform/ui/lib";
import { useState } from "react";

import { iconMapper } from "@/components/icon-mapper";

import { DEFAULT_TOOL_ICON_KEY } from "../utils/custom-tools-converter";
import { FallbackImageIcon } from "./FallbackImageIcon";

interface CustomToolIconProps {
  /** Icon key (icon-mapper) or brand asset path for the tool. */
  icon?: string;
  /** Optional user-supplied tool icon URL; takes precedence over `icon`. */
  iconUrl?: string;
  className?: string;
}

/**
 * Renders a custom tool's icon with layered fallbacks: user-supplied icon URL →
 * icon-mapper glyph → brand image (with load-error fallback) → the shared
 * WrenchIcon mapper glyph, so L2 rows and L3 actions always render the same
 * default icon when no icon is configured.
 */
export const CustomToolIcon = ({ icon, iconUrl, className }: CustomToolIconProps) => {
  const [hasImageError, setHasImageError] = useState(false);

  const resolved = icon || DEFAULT_TOOL_ICON_KEY;
  const wrapperClass = cn("flex h-5 w-5 shrink-0 items-center justify-center", className);

  // User-supplied icon URL wins; on load failure fall through to the glyphs below.
  if (iconUrl?.trim() && !hasImageError) {
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

  // Icon-mapper key (shared wrench fallback or a registered glyph).
  if (resolved in iconMapper) {
    return <div className={wrapperClass}>{iconMapper[resolved]}</div>;
  }

  // Brand asset path; falls back to the wrench when missing or broken.
  if (icon && !hasImageError) {
    return (
      <div className={wrapperClass}>
        <FallbackImageIcon className="h-5 w-5" src={icon} onError={() => setHasImageError(true)} />
      </div>
    );
  }

  // Should be unreachable (DEFAULT_TOOL_ICON_KEY is a mapper key) but kept as a
  // hard guarantee that a glyph always renders.
  return <div className={wrapperClass}>{iconMapper[DEFAULT_TOOL_ICON_KEY]}</div>;
};
