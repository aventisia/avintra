import { cn } from "@avplatform/ui/lib";

const PERSON_TINTS = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];

const getInitials = (name: string) =>
  name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const getPersonTint = (name: string) => {
  const hash = [...name].reduce((total, character) => total + character.charCodeAt(0), 0);
  return PERSON_TINTS[hash % PERSON_TINTS.length];
};

/**
 * Round initials avatar tinted by the name, so a person keeps the same color everywhere.
 */
export const PersonAvatar = ({ name, className }: { name: string; className?: string }) => (
  <span
    aria-hidden="true"
    className={cn(
      "grid size-6 shrink-0 place-items-center rounded-full text-[0.625rem] font-semibold",
      getPersonTint(name),
      className,
    )}
  >
    {getInitials(name)}
  </span>
);
