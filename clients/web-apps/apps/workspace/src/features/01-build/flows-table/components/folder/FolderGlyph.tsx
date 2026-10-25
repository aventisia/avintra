import { cn } from "@avplatform/ui/lib";

/**
 * Two-tone folder icon. Its front flap tilts open while an agent is dragged over the nearest
 * `group/drop` ancestor.
 */
export const FolderGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path
      opacity={0.45}
      d="M2.5 6.25A2.25 2.25 0 0 1 4.75 4h3.86c.6 0 1.18.24 1.6.67l1.08 1.08c.42.42 1 .66 1.59.66h6.37a2.25 2.25 0 0 1 2.25 2.25v8.84a2.25 2.25 0 0 1-2.25 2.25H4.75A2.25 2.25 0 0 1 2.5 17.5V6.25Z"
    />
    <g
      className={cn(
        "origin-bottom transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] [transform-box:fill-box]",
        "group-data-[drop-active=true]/drop:[transform:skewX(-12deg)_scaleY(0.8)]",
      )}
    >
      <path d="M2.5 10.25A2.25 2.25 0 0 1 4.75 8h14.5a2.25 2.25 0 0 1 2.25 2.25v7.25a2.25 2.25 0 0 1-2.25 2.25H4.75A2.25 2.25 0 0 1 2.5 17.5v-7.25Z" />
      <path
        d="M5 9.6h14"
        stroke="white"
        strokeOpacity={0.4}
        strokeWidth={1}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  </svg>
);
