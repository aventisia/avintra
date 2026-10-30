import { cn } from "@avplatform/ui/lib";

const getInitials = (name: string) =>
  name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

/**
 * Round initials avatar.
 */
export const PersonAvatar = ({ name, className }: { name: string; className?: string }) => (
  <span
    aria-hidden="true"
    className={cn(
      "grid size-6 shrink-0 place-items-center rounded-full bg-fill text-[0.625rem] font-semibold text-ink",
      className,
    )}
  >
    {getInitials(name)}
  </span>
);
