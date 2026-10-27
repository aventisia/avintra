type StatsCardProps = {
  /** Icon to be displayed in the card */
  icon: React.ReactNode;

  /** Title of the card */
  title: React.ReactNode;

  /** Main content of the card */
  content: React.ReactNode;

  /** Optional footer content */
  footer?: React.ReactNode;
};

/**
 * A functional component that renders a statistics card with an icon, title, content, and an optional footer.
 */
export const StatsCard = ({ icon, title, content, footer }: StatsCardProps) => {
  return (
    <div className="flex flex-row items-center gap-3 rounded-lg border border-line bg-surface p-4">
      <div className="grid place-items-center rounded-md border border-line bg-sunken p-3 text-ink-2">
        {icon}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="font-mono text-label uppercase text-muted-foreground">{title}</h3>
        <div className="font-mono text-[28px] font-medium leading-8 tracking-[-0.02em] tabular-nums text-ink">
          {content}
        </div>
        {footer && <div className="font-mono text-hint text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
};
