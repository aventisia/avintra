import { Separator } from "@avplatform/ui";
import { logOffFromCurrentSession } from "@avplatform/ui/apis/accounts-me-apis";
import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import { Button, buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { getUserDisplayName } from "@avplatform/ui/utils";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

/** Header avatar menu with the signed-in identity and Logout. */
const UserAccountMenu = () => {
  const { userSession, setUserSession } = useUserSessionStore();
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: logOffFromCurrentSession,
    onSuccess: (response) => {
      if (!response.data) {
        toast.error(response.message);
        return;
      }
      setUserSession(null);
      localStorage.removeItem("tenant_switch");
      window.location.assign(import.meta.env.VITE_ACCOUNTS_PATH);
    },
    onError: (error) => toast.error(error.toString()),
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon10" }),
          "rounded-full border-[4px] border-secondary hover:border-primary",
        )}
      >
        <Avatar className="flex h-8 w-8">
          <AvatarFallback className="border-none bg-primary-200 font-bold capitalize tracking-wider text-primary-900">
            {userSession?.userInitials ?? "--"}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-[15rem] flex-col p-1">
        <div className="flex flex-col justify-center gap-1 px-3.5 pb-2 pt-2.5">
          <span className="truncate whitespace-nowrap text-base font-medium uppercase leading-4">
            {userSession ? getUserDisplayName(userSession) : "User Name"}
          </span>
          <span className="truncate whitespace-nowrap text-2xs font-normal lowercase">
            {userSession?.email ?? "useremail@domain.com"}
          </span>
        </div>
        <Separator className="my-1 h-[0.5px]" />
        <Button
          variant="ghost"
          className="h-9 justify-start gap-2 rounded-sm align-middle font-normal"
          onClick={() => mutate()}
        >
          {isPending ? (
            <CircleNotchIcon className="h-4 w-4 animate-spin text-[--icon-color]" />
          ) : (
            <ArrowLeftStartOnRectangleIcon className="h-4 w-4" />
          )}
          Logout
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export { UserAccountMenu };
