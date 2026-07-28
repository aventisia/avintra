import { AvatarExt } from "@avplatform/ui/avatar";

/**
 * TODO: Renders the avatar of the who commented on the flow.
 */
export const FCIAvatar = () => {
  return (
    <AvatarExt
      className="mt-0.5 h-8 w-8"
      avatarSrc={import.meta.env.BASE_URL + "sample-img_placeholder.jpg"}
      initials=""
    />
  );
};
