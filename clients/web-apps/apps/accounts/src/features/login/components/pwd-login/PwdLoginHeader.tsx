import { Button } from "@avplatform/ui/buttons";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { useLoginStore } from "../../stores/login-store";

export const PwdLoginHeader = () => {
  // Get store state and actions
  const { loginData, setStepNo } = useLoginStore(
    useShallow((state) => ({
      loginData: state.loginData,
      setStepNo: state.setStepNo,
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
        <h2 className="ml-3 w-full truncate text-body text-ink-2">{loginData?.email}</h2>
      </div>
      <h1 className="text-title text-ink">Enter password</h1>
    </div>
  );
};
