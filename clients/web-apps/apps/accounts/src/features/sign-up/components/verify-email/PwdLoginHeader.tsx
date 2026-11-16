import { Button } from "@avplatform/ui/buttons";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { useCreateAccountStore } from "../../stores/create-account-store";

export const PwdLoginHeader = () => {
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
      <div className="mb-2 flex items-center text-sm">
        <Button
          variant="outline"
          size="icon8"
          className="min-w-[2rem]"
          onClick={() => setStepNo(1)}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h2 className="ml-3 w-full truncate text-body text-ink-2">{verifyEmailData?.email}</h2>
      </div>
      <h1 className="text-title text-ink">Enter password</h1>
    </div>
  );
};
