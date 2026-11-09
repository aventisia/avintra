import { cn } from "@avplatform/ui/lib";

import { getTemplateIconUrls } from "../utils/template-attributes.util";

type TemplateIntegrationsProps = {
  icons?: string[];
  /** Icons shown before the rest collapse into a "+n" tile; all are shown when omitted. */
  limit?: number;
  size?: "sm" | "md";
};

const SIZES = {
  sm: { tile: "size-6 rounded-sm", image: "size-3.5" },
  md: { tile: "size-9 rounded-md", image: "size-5" },
};

/**
 * Row of the integration icons a template uses.
 */
export const TemplateIntegrations = ({ icons, limit, size = "sm" }: TemplateIntegrationsProps) => {
  const urls = getTemplateIconUrls(icons);
  const shown = limit !== undefined && urls.length > limit ? urls.slice(0, limit - 1) : urls;
  const hiddenCount = urls.length - shown.length;
  const tileClassName = cn(
    "grid shrink-0 place-items-center bg-sunken ring-1 ring-inset ring-line",
    SIZES[size].tile,
  );

  if (urls.length === 0) return null;

  return (
    <span className="flex min-w-0 items-center gap-1">
      {shown.map((url) => (
        <span key={url} className={tileClassName}>
          <img src={url} alt="" className={SIZES[size].image} />
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className={cn(tileClassName, "text-[10.5px] font-medium tabular-nums text-ink-2")}>
          +{hiddenCount}
        </span>
      )}
    </span>
  );
};
