import { Separator } from "@avplatform/ui";
import { logOffFromCurrentSession } from "@avplatform/ui/apis";
import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import { Button, buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { toast } from "@avplatform/ui/sonner";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { getUserDisplayName } from "@avplatform/ui/utils";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useMutation } from "@tanstack/react-query";
import { Loader2, UserIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

interface UserAccountModalProps {
  /** Additional class name to override popover content container style */
  className?: string;

  /** Additional class name to override avatar size. Only pass h-,w- */
  sizeClassName?: string;
}

const UserAccountModal = ({ className, sizeClassName = "h-8 w-8" }: UserAccountModalProps) => {
  // Get user session state and actions
  const { userSession, setUserSession } = useUserSessionStore();

  //state to close the popover
  const { isPopOverOpen, setisPopOverOpen } = useBaseLayoutStore(
    useShallow((state) => ({
      isPopOverOpen: state.isPopOverOpen,
      setisPopOverOpen: state.setIsPopOverOpen,
    })),
  );

  // Get navigate function
  const navigate = useNavigate();

  // Define mutation to log off from current session
  const { mutate, isPending } = useMutation({
    mutationFn: logOffFromCurrentSession,
    onSuccess: (httpResponse) => {
      if (httpResponse.data) {
        setUserSession(null);
        navigate("/redirect?msg=Logging out...&url=" + import.meta.env.VITE_ACCOUNTS_PATH);
      } else toast.error(httpResponse.message);
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return (
    <Popover open={isPopOverOpen} onOpenChange={setisPopOverOpen}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon10" }),
          "rounded-full border-[4px] border-secondary hover:border-primary",
        )}
      >
        <Avatar className={cn("flex", sizeClassName)}>
          <AvatarFallback className="bg-primary-200 font-bold capitalize tracking-wider text-primary-900">
            {userSession ? userSession?.userInitials : "--"}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent align="end" className={cn("flex w-[15rem] flex-col p-1", className)}>
        {/* Header */}
        <div className={cn("flex flex-col justify-center gap-1 px-3.5 pb-2 pt-2.5")}>
          <Link
            to="/account"
            onClick={() => setisPopOverOpen(false)}
            className="truncate whitespace-nowrap text-base font-medium uppercase leading-4 hover:text-primary"
          >
            {userSession ? getUserDisplayName(userSession) : "User Name"}
          </Link>
          <span className="truncate whitespace-nowrap text-2xs font-normal lowercase">
            {userSession ? userSession?.email : "useremail@domain.com"}
          </span>
          {userSession?.tenantName === userSession?.email ? null : (
            <span
              title={userSession ? userSession?.tenantName : "Tenant Name"}
              className="truncate whitespace-nowrap text-2xs font-medium"
            >
              {userSession ? userSession?.tenantName : "Tenant Name"}
            </span>
          )}
        </div>
        <Separator className="my-1 h-[0.5px]" />
        <Button
          variant={"ghost"}
          className="h-9 justify-start gap-2 rounded-sm align-middle font-normal"
          onClick={() => {
            navigate("/account");
            setisPopOverOpen(false);
          }}
        >
          <UserIcon className="h-4 w-4" />
          My Account
        </Button>
        <Separator className="my-1 h-[0.5px]" />
        {/* Logout */}
        <Button
          variant={"ghost"}
          className="h-9 justify-start gap-2 rounded-sm align-middle font-normal"
          onClick={() => mutate()}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-[--icon-color]" />
          ) : (
            <ArrowLeftStartOnRectangleIcon className="h-4 w-4" />
          )}
          Logout
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export { UserAccountModal };
