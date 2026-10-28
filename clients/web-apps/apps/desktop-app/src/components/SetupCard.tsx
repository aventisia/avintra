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
    <main className="flex flex-1 items-center justify-center bg-bg p-6">
      <div className="z-10 flex w-full max-w-[29rem] flex-col gap-6 rounded-lg border border-line bg-surface p-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-title text-ink">{title}</h2>
          <p className="text-body text-ink-2">{subtitle}</p>
        </div>

        <div className="flex flex-col gap-4">{children}</div>
      </div>
    </main>
  );
}
