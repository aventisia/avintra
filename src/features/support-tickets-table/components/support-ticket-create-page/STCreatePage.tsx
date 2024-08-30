import { SupportTicketCrudForm } from "../support-ticket-crud-dialog/SupportTicketCrudForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/react-toolkit/ui/avatar";
import { STDetailsSideComponent } from "../support-ticket-details/STDetailsSideComponent";

export const STCreatePage = () => {
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
      <div className="w-[20%]">
        <STDetailsSideComponent />
      </div>
    </div>
  );
};
