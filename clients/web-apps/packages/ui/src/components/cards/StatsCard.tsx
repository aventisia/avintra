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
    <div className="flex flex-row items-center rounded-lg border border-primary-100 bg-card p-3.5">
      <div className="rounded-lg bg-primary-50 p-4 text-primary">{icon}</div>
      <div className="mx-3.5 flex flex-col gap-1">
        <h3 className="text-xs font-medium tracking-wide">{title}</h3>
        <div className="text-xl font-semibold leading-none tracking-tight">{content}</div>
        {footer && <div className="text-2xs text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
};
