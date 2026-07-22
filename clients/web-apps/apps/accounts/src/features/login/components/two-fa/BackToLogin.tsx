import { Button } from "@avplatform/ui/buttons";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { ContentFooter } from "@/components/ui/ContentFooter";

import { useLoginStore } from "../../stores/login-store";

export const BackToLogin = () => {
  // Get store state and actions
  const { resetLoginProcess } = useLoginStore(
    useShallow((state) => ({
      resetLoginProcess: state.resetLoginProcess,
    })),
  );

  return (
    <ContentFooter>
      <Button className="text-md h-0 p-0 font-normal" variant={"link"} onClick={resetLoginProcess}>
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="ml-2">Back to log in</span>
      </Button>
    </ContentFooter>
  );
};
