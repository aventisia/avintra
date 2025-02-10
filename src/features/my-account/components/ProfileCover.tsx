import Lucide from "@/react-toolkit/ui/Lucide";
import clsx from "clsx";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { useShallow } from "zustand/react/shallow";

export const ProfileCover = () => {
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );
  return (
    <div className="box flex flex-col p-1.5">
      <div className="relative h-60 w-full rounded-[0.6rem] bg-gradient-to-b from-theme-1/95 to-theme-2/95">
        <div
          className={clsx([
            "relative h-full w-full overflow-hidden",
            "before:absolute before:inset-0 before:-mt-[50rem] before:bg-texture-white before:content-['']",
            "after:absolute after:inset-0 after:-mt-[50rem] after:bg-texture-white after:content-['']",
          ])}
        ></div>
        <div className="absolute inset-x-0 top-0 mx-auto mt-36 h-32 w-32">
          <div className="box image-fit h-full w-full overflow-hidden rounded-full border-[6px] border-white">
            {/* <Avatar>
              <AvatarImage src={userSession?.avatarSrc} />
            </Avatar>
            <Image /> */}
            <img alt={userSession?.userInitials} src={userSession?.avatarSrc} />
          </div>
        </div>
      </div>
      <div className="dark:bg-darkmode-500 flex flex-col justify-center gap-y-3 rounded-[0.6rem] bg-slate-50 p-5 pt-12 sm:flex-row sm:items-center md:items-center">
        <Button
          variant="outline"
          className="hover:text-primary/50 hover:bg-primary/60 border-primary bg-theme-1/10 py-6 font-semibold text-primary transition-all delay-200"
        >
          <Lucide icon="Image" className="mr-2.5 h-4 w-4 stroke-[1.3]" />
          Upload Cover
        </Button>
      </div>
    </div>
  );
};
