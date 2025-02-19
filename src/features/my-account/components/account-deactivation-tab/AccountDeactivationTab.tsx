import { useShallow } from "zustand/react/shallow";
import { AccountDeactivation } from "./AccountDeactivation";
import { DeactivationVerifyEmailForm } from "./DeactivationVerifyEmailForm";
import { useAccountDeactivationStore } from "../../stores/account-deactivation-store";

export const AccountDeactivationTab = () => {
  // Get store state
  const { stepNo } = useAccountDeactivationStore(
    useShallow((state) => ({
      stepNo: state.stepNo,
    })),
  );

  // Return component
  return (
    <>
      {/* Step 1 - update email step */}
      {stepNo === 1 && <AccountDeactivation />}

      {/* Step 2 - Verify email address step */}
      {stepNo === 2 && <DeactivationVerifyEmailForm />}
    </>
  );
};
