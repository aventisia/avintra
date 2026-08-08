import type { ReactNode } from "react";

interface SetupCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

/**
 * Shared shell for the desktop-app setup screens (Service URL entry and
 * Runner App provisioning). Keeps the two steps visually consistent.
 */
export function SetupCard({ title, subtitle, children }: SetupCardProps) {
  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 p-6">
      <div className="z-10 flex w-full max-w-[29rem] flex-col gap-4 rounded-[1.25rem] border border-border bg-card p-12 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-3">
          <h2 className="flex -mt-1 items-center text-4xl font-medium text-foreground tracking-tight">
            {title}
          </h2>
          <p className="ml-0.5 flex items-center text-md text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex flex-col gap-4">{children}</div>
      </div>
    </main>
  );
}
