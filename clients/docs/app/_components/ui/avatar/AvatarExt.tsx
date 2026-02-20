import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib";

interface AvatarExtProps {
  /** User name's initials as required as fallback if user avatar image is null */
  initials: string;

  /** (Optional): User's avatar/profile image url */
  avatarSrc?: string;

  /** (Optional): To pass css classes to override Avatar container style */
  className?: string;
}

const AvatarExt = ({ initials, avatarSrc, className }: AvatarExtProps) => {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
    >
      <AvatarPrimitive.Image
        className={cn("aspect-square h-full w-full")}
        src={avatarSrc}
        alt={initials}
      />
      <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm capitalize tracking-wide">
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
};

export { AvatarExt };
