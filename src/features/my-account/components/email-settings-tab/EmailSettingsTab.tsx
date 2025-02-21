import { useShallow } from "zustand/react/shallow";
import { EnterEmail } from "./EnterEmail";
import { VerifyEmail } from "./VerifyEmail";
import { useProfileEmailUpdateStore } from "../../stores/profile-email-update-store";

export const EmailSettingsTab = () => {
  // Get store state
  const { stepNo } = useProfileEmailUpdateStore(
    useShallow((state) => ({
      stepNo: state.stepNo,
    })),
  );

  // Return component
  return (
    <>
      {/* Step 1 - update email step */}
      {stepNo === 1 && <EnterEmail />}

      {/* Step 2 - Verify email address step */}
      {stepNo === 2 && <VerifyEmail />}
    </>
  );
};
