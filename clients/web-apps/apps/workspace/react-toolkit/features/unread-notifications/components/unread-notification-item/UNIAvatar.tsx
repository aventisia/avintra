import { AvatarExt } from "@avplatform/ui/avatar";

/**
 * TODO: Renders the avatar of the sender user who caused the notification
 * or the app avatar or icon based on notification type
 */
export const UNIAvatar = () => {
  return (
    <AvatarExt
      className="mt-0.5 h-8 w-8"
      avatarSrc={import.meta.env.BASE_URL + "img_placeholder.jpg"}
      initials=""
    />
  );
};
