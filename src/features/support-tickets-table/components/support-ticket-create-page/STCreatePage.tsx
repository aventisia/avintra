import { Separator } from "@/react-toolkit/ui/separator";
import { SupportTicketCrudForm } from "../support-ticket-crud-dialog/SupportTicketCrudForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/react-toolkit/ui/avatar";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export const STCreatePage = () => {
  const navigate = useNavigate();

  const RouteToSTtable = () => {
    // Route to the support tickets table page
    navigate("/supportticket");
  };

  return (
    <div className="flex h-screen px-[3%] py-[3%]">
      <div className="mainComponent flex h-full w-full">
        <div>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>User</AvatarFallback>
          </Avatar>
        </div>
        <div className="ml-2 h-full flex-grow">
          <SupportTicketCrudForm />
        </div>
      </div>
      <div className="sideComponent ml-4 flex h-full w-[20%] flex-col space-y-4 text-2xs">
        <div>
          <Button
            variant={"link"}
            size={"lg"}
            className=""
            onClick={RouteToSTtable}
          >
            <ArrowLeftCircleIcon className="mr-1 h-5 w-5" />
            Go back
          </Button>
        </div>
        <div className="space-y-2 pl-1 text-gray-600">
          <p className="font-medium">Ticket id</p>
          <p className="font-light">Not assigned yet</p>
        </div>
        <Separator />
        <div className="space-y-2 pl-1 text-gray-600">
          <p className="font-medium">Ticket number</p>
          <p className="font-light">Not assigned yet</p>
        </div>
        <Separator />
        <div className="space-y-2 pl-1 text-gray-600">
          <p className="font-medium">Ticket status</p>
          <p className="font-light">None yet</p>
        </div>
        <Separator />
        <div className="space-y-2 pl-1 text-gray-600">
          <p className="font-medium">Date & time of creation</p>
          <p className="font-light">Not assigned yet</p>
        </div>
        <Separator />
        <div className="space-y-2 pl-1 text-gray-600">
          <p className="font-medium">Date & time of last modification</p>
          <p className="font-light">Not assigned yet</p>
        </div>
        <Separator />
      </div>
    </div>
  );
};
