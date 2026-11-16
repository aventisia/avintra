import * as React from "react";

import { cn } from "./cn.util";
import { type IconInput, KitIcon } from "./icons";

/** Semantic color tone shared by badges, alerts, stats, and progress bars. */
export type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const TONE_SOFT: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground ring-border",
  primary: "bg-primary/10 text-primary ring-primary/20",
  success: "bg-success/10 text-success ring-success/25",
  warning: "bg-warning/10 text-warning ring-warning/25",
  danger: "bg-destructive/10 text-destructive ring-destructive/25",
  info: "bg-info/10 text-info ring-info/25",
};

const TONE_SOLID: Record<Tone, string> = {
  neutral: "bg-muted-foreground",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
};

const BUTTON_VARIANTS = {
  primary: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-border bg-card text-foreground shadow-xs hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
  destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
  link: "h-auto px-0 text-primary underline-offset-4 hover:underline",
} as const;

const BUTTON_SIZES = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-9 gap-2 px-4 text-sm",
  lg: "h-10 gap-2 px-5 text-sm",
  icon: "size-9",
  "icon-sm": "size-8",
} as const;

/** Props for {@link Button}. */
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
  icon?: IconInput;
  iconRight?: IconInput;
  loading?: boolean;
};

/** Action button with variants, sizes, optional icons, and a loading state. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon,
      iconRight,
      loading = false,
      disabled,
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? <KitIcon icon="Loader2" className="animate-spin" /> : <KitIcon icon={icon} />}
      {children}
      <KitIcon icon={iconRight} />
    </button>
  ),
);
Button.displayName = "Button";

/** Props for {@link Badge}. */
export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  icon?: IconInput;
  dot?: boolean;
};

/** Small status or category label. */
export const Badge = ({
  tone = "neutral",
  icon,
  dot,
  className,
  children,
  ...props
}: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
      TONE_SOFT[tone],
      className,
    )}
    {...props}
  >
    {dot && <span aria-hidden className={cn("size-1.5 rounded-full", TONE_SOLID[tone])} />}
    <KitIcon icon={icon} size={12} />
    {children}
  </span>
);

const STATUS_TONE_PATTERNS: [RegExp, Tone][] = [
  [/fail|error|reject|cancel|overdue|block|declin|expired|lost/i, "danger"],
  [/complet|done|success|approv|paid|resolv|active|closed won|delivered|pass/i, "success"],
  [/pend|wait|hold|review|draft|queued|scheduled|due/i, "warning"],
  [/progress|process|running|open|new|assigned|started/i, "info"],
];

/** Picks a tone for a free-text status such as "InProgress" or "Rejected". */
export const toneForStatus = (status: unknown): Tone => {
  const text = String(status ?? "");
  return STATUS_TONE_PATTERNS.find(([pattern]) => pattern.test(text))?.[1] ?? "neutral";
};

/** Badge whose tone is derived from a status name; splits camel case for display. */
export const StatusBadge = ({ status, className }: { status: unknown; className?: string }) => (
  <Badge tone={toneForStatus(status)} dot className={className}>
    {String(status ?? "Unknown").replace(/([a-z])([A-Z])/g, "$1 $2")}
  </Badge>
);

/** Surface container with border, radius, and subtle shadow. */
export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-xl border border-border bg-card text-card-foreground shadow-xs",
      className,
    )}
    {...props}
  />
);

/** Card heading row with optional description and trailing actions. */
export const CardHeader = ({
  title,
  description,
  actions,
  icon,
  className,
  children,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: IconInput;
  className?: string;
  children?: React.ReactNode;
}) => (
  <div className={cn("flex items-start justify-between gap-4 p-5 pb-3", className)}>
    <div className="flex min-w-0 items-start gap-3">
      {icon && (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <KitIcon icon={icon} size={18} />
        </span>
      )}
      <div className="min-w-0 space-y-1">
        {title && <h3 className="text-sm leading-tight font-semibold text-foreground">{title}</h3>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {children}
      </div>
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);

/** Card body. */
export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-5 pt-0", className)} {...props} />
);

/** Card footer row, usually for actions. */
export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-end gap-2 border-t border-border px-5 py-3",
      className,
    )}
    {...props}
  />
);

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const AVATAR_TINTS = [
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
];

/** Initials avatar with a stable tint per name, or an image when `src` is a data URL or asset. */
export const Avatar = ({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const tint =
    AVATAR_TINTS[
      [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0) % AVATAR_TINTS.length
    ];
  const sizeClass = { sm: "size-6 text-[10px]", md: "size-8 text-xs", lg: "size-10 text-sm" }[size];
  return src ? (
    <img
      src={src}
      alt={name}
      className={cn("shrink-0 rounded-full object-cover", sizeClass, className)}
    />
  ) : (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        tint,
        sizeClass,
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
};

/** Horizontal or vertical divider. */
export const Separator = ({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) => (
  <div
    role="separator"
    aria-orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className,
    )}
  />
);

/** Keyboard key hint. */
export const Kbd = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <kbd
    className={cn(
      "inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground",
      className,
    )}
    {...props}
  />
);

/** Determinate progress bar with an accessible label. */
export const Progress = ({
  value,
  max = 100,
  label,
  tone = "primary",
  showValue = false,
  className,
}: {
  value: number;
  max?: number;
  label?: string;
  tone?: Tone;
  showValue?: boolean;
  className?: string;
}) => {
  const percent = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {showValue && (
            <span className="text-muted-foreground tabular-nums">{Math.round(percent)}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label ?? "Progress"}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", TONE_SOLID[tone])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

/** Animated placeholder block for loading states. */
export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div aria-hidden className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
);

/** Inline loading indicator with screen-reader text. */
export const Spinner = ({
  label = "Loading",
  className,
}: {
  label?: string;
  className?: string;
}) => (
  <span
    role="status"
    className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}
  >
    <KitIcon icon="Loader2" className="animate-spin" />
    <span className="sr-only">{label}</span>
  </span>
);

const ALERT_ICONS: Record<Tone, string> = {
  neutral: "Info",
  primary: "Info",
  info: "Info",
  success: "CheckCircle2",
  warning: "AlertTriangle",
  danger: "XCircle",
};

/** Inline message with tone, title, optional description, and actions. */
export const Alert = ({
  tone = "info",
  title,
  children,
  action,
  icon,
  className,
}: {
  tone?: Tone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  icon?: IconInput;
  className?: string;
}) => (
  <div
    role={tone === "danger" || tone === "warning" ? "alert" : "status"}
    className={cn(
      "flex items-start gap-3 rounded-lg p-3 text-sm ring-1 ring-inset",
      TONE_SOFT[tone],
      className,
    )}
  >
    <KitIcon icon={icon ?? ALERT_ICONS[tone]} size={18} className="mt-px" />
    <div className="min-w-0 flex-1 space-y-0.5">
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className="text-foreground/80">{children}</div>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

/** Centered empty state with icon, title, description, and an optional action. */
export const EmptyState = ({
  icon = "Inbox",
  title,
  description,
  action,
  className,
}: {
  icon?: IconInput;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
      className,
    )}
  >
    <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <KitIcon icon={icon} size={22} />
    </span>
    <div className="max-w-sm space-y-1">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
    {action}
  </div>
);
