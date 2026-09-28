import { cn } from "@avplatform/ui/lib";
import { Wrench } from "lucide-react";
import { useState } from "react";

import { getToolIcon } from "../constants/tool-icon-mapper";

interface ToolIconProps {
  /** Tool name, used to resolve a mapped brand asset. */
  name?: string;
  /** User-supplied icon URL; takes precedence over any mapped brand asset. */
  iconUrl?: string;
  className?: string;
}

/**
 * Renders a tool's icon with layered fallbacks: user-supplied icon URL → mapped
 * brand asset → the shared Wrench glyph (the same default the studio canvas node
 * uses). The legacy cloud placeholder is never rendered.
 */
export const ToolIcon = ({ name, iconUrl, className }: ToolIconProps) => {
  const [hasError, setHasError] = useState(false);
  const basePath = import.meta.env.VITE_WORKSPACE_PATH?.replace(/\/$/, "") || "";
  const brandIcon = getToolIcon(name);
  const userIcon = iconUrl?.trim();

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

  return <Wrench className={cn("text-slate-600", className)} aria-hidden="true" />;
};
