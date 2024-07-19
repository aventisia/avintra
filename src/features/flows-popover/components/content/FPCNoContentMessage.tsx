import { Workflow } from "lucide-react";
import { Button, NoContentMessage } from "@/react-toolkit/components/ui";
import { PlusIcon } from "@heroicons/react/24/outline";

/**
 * Renders a component that displays a message when there are no flows.
 */
export const FPCNoContentMessage = () => {
  return (
    <NoContentMessage
      className="mb-12"
      Icon={Workflow}
      primaryMessage="No flows"
      secondaryMessage="Create a flow to get started"
      action={
        <Button className="mt-4 h-8 gap-2 px-2.5 tracking-wide">
          <PlusIcon className="h-4 w-4" />
          Create
        </Button>
      }
    />
  );
};
