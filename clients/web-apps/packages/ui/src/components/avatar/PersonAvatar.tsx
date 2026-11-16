import { cn } from "@/ui/lib";

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
const SIZE_CLASSES = {
  sm: "size-5 text-[9px]",
  md: "size-6 text-[0.625rem]",
};

type PersonAvatarProps = {
  name: string;
  /** `sm` sits inline with a record fact or detail value. */
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
};

export const PersonAvatar = ({ name, size = "md", className }: PersonAvatarProps) => (
  <span
    aria-hidden="true"
    style={getAvatarColors(name)}
    className={cn(
      "grid shrink-0 place-items-center rounded-full font-semibold",
      SIZE_CLASSES[size],
      className,
    )}
  >
    {getInitials(name)}
  </span>
);
