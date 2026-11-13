import { cn } from "@avplatform/ui/lib";
import { type Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

const TONES = {
  ok: "text-ok",
  warn: "text-warn",
  bad: "text-bad",
  idle: "text-muted-foreground",
} as const;

type TemplateNoticeProps = {
  tone: keyof typeof TONES;
  Icon: Icon;
  title: string;
  children?: ReactNode;
};

/**
 * Tinted notice block in the card dialog style, used for approval and validation states.
 */
export const TemplateNotice = ({
  tone,
  Icon: NoticeIcon,
  title,
  children,
}: TemplateNoticeProps) => (
  <div className="flex gap-3 rounded-md bg-sunken/80 px-3.5 py-3 ring-1 ring-line">
    <NoticeIcon className={cn("mt-0.5 size-4 shrink-0", TONES[tone])} />
    <div className="min-w-0">
      <p className="text-[13px] font-semibold text-ink">{title}</p>
      {children && <div className="text-[12px] leading-5 text-muted-foreground">{children}</div>}
    </div>
  </div>
);
