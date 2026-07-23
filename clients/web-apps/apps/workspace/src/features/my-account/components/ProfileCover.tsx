import { useUserSessionStore } from "@avplatform/ui/stores";
import clsx from "clsx";
import { useShallow } from "zustand/react/shallow";

export const ProfileCover = () => {
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );
  return (
    <div className="box flex flex-col p-1.5 pb-20">
      <div className="from-theme-1/95 to-theme-2/95 relative h-60 w-full rounded-[0.6rem] bg-gradient-to-b">
        <div
          className={clsx([
            "relative h-full w-full overflow-hidden",
            "before:bg-texture-white before:absolute before:inset-0 before:-mt-[50rem] before:content-['']",
            "after:bg-texture-white after:absolute after:inset-0 after:-mt-[50rem] after:content-['']",
          ])}
        ></div>
        <div className="absolute inset-x-0 top-0 mx-auto mt-36 h-32 w-32">
          <div className="box image-fit h-full w-full overflow-hidden rounded-full border-[6px] border-slate-300">
            {(userSession?.avatarSrc && (
              <img alt={userSession?.userInitials} src={userSession?.avatarSrc} />
            )) || (
              <div className="flex h-28 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-justify dark:bg-gray-300">
                <span className="text-5xl font-bold text-gray-600 dark:text-gray-300">
                  {userSession?.userInitials}
                </span>
              </div>
            )}
          </div>
          {/* <div className="dark:bg-darkmode-500 flex flex-col justify-center gap-y-3 rounded-[0.6rem] bg-slate-50 p-5 pt-12 sm:flex-row sm:items-center md:items-center">
            <Button
              variant="outline"
              className="hover:text-primary/50 hover:bg-primary/60 border-primary bg-theme-1/10 py-6 font-semibold text-primary transition-all delay-200"
            >
              <Lucide icon="Image" className="mr-2.5 h-4 w-4 stroke-[1.3]" />
              Upload Cover
            </Button>
          </div> */}
        </div>
      </div>
    </div>
  );
};
