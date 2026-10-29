import { Button } from "@avplatform/ui/buttons";
import { ArrowLeft } from "lucide-react";
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
        <ArrowLeft className="h-4 w-4" />
        <span className="ml-1">Back to create account</span>
      </Button>
    </ContentFooter>
  );
};
