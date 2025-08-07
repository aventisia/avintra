import { NoContentMessage } from "@aventisia/ui";
import { CommandEmpty } from "@aventisia/ui/command";
import { User2Icon } from "lucide-react";

/**
 * Renders a component that displays a message when there are no users.
 */
export const UsersNoContentMessage = () => {
  return (
    <CommandEmpty>
      <NoContentMessage
        // className="-mt-5"
        Icon={User2Icon}
        primaryMessage="No user found"
      />
    </CommandEmpty>
  );
};
