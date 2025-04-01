import { logOffFromCurrentSession } from "@/react-toolkit/apis/accounts-me-apis";
import { DefaultTenantsEnum } from "@/react-toolkit/enums/default-tenants-enum";
import { cn } from "@/react-toolkit/lib/utils";
import { useBaseLayoutStore } from "@/react-toolkit/stores/base-layout-store";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { Avatar, AvatarFallback } from "@/react-toolkit/ui/avatar";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import Lucide from "@/react-toolkit/ui/Lucide";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/react-toolkit/ui/popover";
import { Separator } from "@/react-toolkit/ui/separator";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

interface UserAccountModalProps {
  /** Additional class name to override popover content container style */
  className?: string;

  /** Additional class name to override avatar size. Only pass h-,w- */
  sizeClassName?: string;
}

const UserAccountModal = ({
  className,
  sizeClassName = "h-8 w-8",
}: UserAccountModalProps) => {
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
        navigate(
          "/redirect?msg=Logging out...&url=" + import.meta.env.VITE_LOGIN_URL,
        );
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
          "rounded-full border-[4px] border-[#363082]",
        )}
      >
        <Avatar className={cn("flex", sizeClassName)}>
          <AvatarFallback className="bg-[#aba7e7] font-bold capitalize tracking-wider text-secondary">
            {userSession ? userSession?.userInitials : "--"}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className={cn("flex w-[15rem] flex-col p-1", className)}
      >
        {/* Header */}
        <div
          className={cn(
            "flex flex-col justify-center gap-1 px-3.5 pb-2 pt-2.5",
          )}
        >
          <Link
            to="/account"
            onClick={() => setisPopOverOpen(false)}
            className="truncate whitespace-nowrap text-base font-medium uppercase leading-4 hover:text-primary"
          >
            {userSession
              ? userSession?.firstName + " " + userSession?.lastName
              : "User Name"}
          </Link>
          <span className="truncate whitespace-nowrap text-2xs font-normal lowercase">
            {userSession ? userSession?.email : "useremail@domain.com"}
          </span>
          {userSession?.tenantName ===
          DefaultTenantsEnum.IndividualUsers ? null : (
            <span className="truncate whitespace-nowrap text-2xs font-medium">
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
          <Lucide icon="User" className="h-4 w-4" />
          My Account
        </Button>
        <Button
          variant={"ghost"}
          className="h-9 justify-start gap-2 rounded-sm align-middle font-normal"
          onClick={() => {
            navigate("/account/email-settings");
            setisPopOverOpen(false);
          }}
        >
          <Lucide icon="MailCheck" className="h-4 w-4" />
          Email settings
        </Button>
        <Button
          variant={"ghost"}
          className="h-9 justify-start gap-2 rounded-sm align-middle font-normal"
          onClick={() => {
            navigate("/account/device-history");
            setisPopOverOpen(false);
          }}
        >
          <Lucide icon="Smartphone" className="h-4 w-4" />
          Device history
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
