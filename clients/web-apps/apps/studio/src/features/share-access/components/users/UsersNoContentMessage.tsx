import { EmptyState } from "@avplatform/ui";
import { CommandEmpty } from "@avplatform/ui/command";
import { UserIcon } from "@phosphor-icons/react";

/**
 * Renders a component that displays a message when there are no users.
 */
export const UsersNoContentMessage = () => {
  return (
    <CommandEmpty>
      <EmptyState
        // className="-mt-5"
        Icon={UserIcon}
        primaryMessage="No user found"
      />
    </CommandEmpty>
  );
};
