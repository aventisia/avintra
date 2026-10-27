import { cn } from "@avplatform/ui/lib";
import { Wrench } from "lucide-react";
import { useState } from "react";

import { getToolIcon } from "../constants/tool-icon-mapper.constant";
import { isValidIconUrl } from "../utils/tool-icon.util";

type ToolIconProps = {
  /** Tool name, used to resolve a mapped brand asset. */
  name?: string;
  /** User-supplied icon URL; takes precedence over any mapped brand asset. */
  iconUrl?: string;
  className?: string;
};

/**
 * Renders a tool's icon with layered fallbacks: user-supplied icon URL, mapped brand asset, then the shared Wrench glyph.
 */
export const ToolIcon = ({ name, iconUrl, className }: ToolIconProps) => {
  const [hasError, setHasError] = useState(false);
  const basePath = import.meta.env.VITE_WORKSPACE_PATH?.replace(/\/$/, "") || "";
  const brandIcon = getToolIcon(name);
  const userIcon = isValidIconUrl(iconUrl) ? iconUrl?.trim() : undefined;

  if (userIcon && !hasError) {
    return (
      <img src={userIcon} alt={name} className={className} onError={() => setHasError(true)} />
    );
  }

  if (brandIcon && !hasError) {
    return (
      <img
        src={`${basePath}${brandIcon}`}
        alt={name}
        className={className}
        onError={() => setHasError(true)}
      />
    );
  }

  return <Wrench className={cn("text-ink-2", className)} aria-hidden="true" />;
};
