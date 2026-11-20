import { useDocumentTitle } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";

type AuthStepLayoutProps = React.PropsWithChildren<{
  title: string;
  description?: React.ReactNode;

  /** Who the step is for, shown under the heading (see `IdentityChip`) */
  identity?: React.ReactNode;

  /** Quiet links under the step, such as "Back to sign in" */
  footer?: React.ReactNode;

  className?: string;
}>;

/** Heading, body and footer of one auth step, sized and spaced the same on every screen. */
const AuthStepLayout = ({
  title,
  description,
  identity,
  footer,
  className,
  children,
}: AuthStepLayoutProps) => {
  useDocumentTitle(title);

  return (
    <section
      aria-labelledby="auth-step-title"
      className={cn(
        "flex w-full max-w-[360px] flex-col gap-6 duration-300 animate-in fade-in-0 slide-in-from-right-2 motion-reduce:animate-none",
        className,
      )}
    >
      <header className="flex flex-col items-start gap-2">
        <h1 id="auth-step-title" className="text-balance text-title text-ink">
          {title}
        </h1>
        {description && (
          <p className="text-pretty text-body text-muted-foreground">{description}</p>
        )}
        {identity && <div className="mt-1 max-w-full">{identity}</div>}
      </header>

      {children}

      {footer && (
        <footer className="flex flex-wrap items-center gap-x-1 gap-y-2 text-body-sm text-muted-foreground">
          {footer}
        </footer>
      )}
    </section>
  );
};

export { AuthStepLayout };
