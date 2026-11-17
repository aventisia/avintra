type VoiceTabHeadingProps = {
  /** Short mono label naming the tab, such as "Engine". */
  label: string;
  title: string;
};

/** A tab's heading: a mono label beside a one-line title. */
export const VoiceTabHeading = ({ label, title }: VoiceTabHeadingProps) => (
  <span className="flex items-baseline gap-2">
    <span className="font-mono text-label uppercase text-muted-foreground">{label}</span>
    <span className="text-body-sm font-semibold text-ink">{title}</span>
  </span>
);
