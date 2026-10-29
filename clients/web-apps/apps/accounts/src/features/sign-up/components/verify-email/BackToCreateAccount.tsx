import { Button } from "@avplatform/ui/buttons";
import { ArrowLeft } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useCreateAccountStore } from "../../stores/create-account-store";

export const BackToCreateAccount = () => {
  // Get store state and actions
  const { verifyEmailData, setStepNo } = useCreateAccountStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      createAccountData: state.createAccountData,
      verifyEmailData: state.verifyEmailData,
    })),
  );

  return (
    <div className="w-full overflow-hidden">
      <div className=" flex items-center text-sm">
        <Button
          variant="outline"
          size="icon8"
          className="min-w-[2rem]"
          onClick={() => setStepNo(1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-md ml-3 w-full truncate">{verifyEmailData?.email}</h2>
      </div>
    </div>
  );
};
