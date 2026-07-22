import { Button } from "@avplatform/ui/buttons";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { ContentFooter } from "@/components/ui/ContentFooter";

import { useCreateAccountStore } from "../../stores/create-account-store";

export const BackToCreateAccount = () => {
  // Get store state and actions
  const { setStepNo } = useCreateAccountStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
    })),
  );

  return (
    <ContentFooter>
      <Button className="text-md h-0 p-0 font-normal" variant={"link"} onClick={() => setStepNo(1)}>
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="ml-1">Back to create account</span>
      </Button>
    </ContentFooter>
  );
};
