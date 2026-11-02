import { cn } from "@avplatform/ui/lib";

// Hues skip yellow-green, which loses contrast on light surfaces.
const AVATAR_HUES = [250, 285, 320, 350, 15, 160, 190, 215];

const getInitials = (name: string) =>
  name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const getAvatarColors = (name: string) => {
  const hash = [...name.toLowerCase()].reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) | 0,
    0,
  );
  const hue = `hsl(${AVATAR_HUES[Math.abs(hash) % AVATAR_HUES.length]} 65% 55%)`;
  return {
    backgroundColor: `color-mix(in srgb, ${hue} 14%, var(--surface))`,
    color: `color-mix(in srgb, ${hue} 80%, var(--ink))`,
  };
};

/**
 * Round initials avatar, tinted by a colour derived from the name.
 */
export const PersonAvatar = ({ name, className }: { name: string; className?: string }) => (
  <span
    aria-hidden="true"
    style={getAvatarColors(name)}
    className={cn(
      "grid size-6 shrink-0 place-items-center rounded-full text-[0.625rem] font-semibold",
      className,
    )}
  >
    {getInitials(name)}
  </span>
);
