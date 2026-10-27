import { ReactNode } from "react";

interface SectionLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

/**
 * Standard header + body layout for each wizard section.
 */
export const SectionLayout = ({ eyebrow, title, description, children }: SectionLayoutProps) => {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[2px] text-primary">{eyebrow}</div>
      <h1 className="mt-1 text-title text-ink">{title}</h1>
      <p className="mt-1.5 mb-7 max-w-[640px] text-[13.5px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children}
    </div>
  );
};
