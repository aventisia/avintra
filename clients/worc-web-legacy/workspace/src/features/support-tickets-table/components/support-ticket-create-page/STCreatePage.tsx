import { UserAccountModal } from "@/react-toolkit/features/user-account/UserAccountModal";

import { SupportTicketCrudForm } from "../support-ticket-crud-dialog/SupportTicketCrudForm";
import { STDetailsSideComponent } from "../support-ticket-details/STDetailsSideComponent";

/**
 * Support ticket create page.
 * @returns STCreatePage JSX.Element
 */
export const STCreatePage = () => {
  return (
    <div className="flex h-screen px-[3%] py-[3%]">
      {/* Main component */}
      <div className="mainComponent flex h-full w-full">
        {/* User avatar icon */}
        <div>
          <UserAccountModal />
        </div>
        {/* Support ticket form */}
        <div className="ml-2 h-full flex-grow">
          <SupportTicketCrudForm />
        </div>
      </div>
      {/* Support ticket details side component */}
      <div className="w-[20%]">
        <STDetailsSideComponent />
      </div>
    </div>
  );
};
