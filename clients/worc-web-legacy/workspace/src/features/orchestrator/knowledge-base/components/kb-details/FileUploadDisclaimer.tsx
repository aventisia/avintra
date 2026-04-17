import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { useShallow } from "zustand/react/shallow";

export default function FileUploadDisclaimer() {
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );
  if (userSession?.deploymentType == "Enterprise") return <></>;
  return (
    <p className="text-xs">
      By uploading documents to Aventisia, you confirm that you have the right
      to share the information contained within them. You must not upload any
      documents that contain sensitive personal data (such as health records,
      financial information, government IDs) unless you have obtained the
      necessary consents and comply with all applicable data protection laws. By
      using this service, you agree to indemnify and hold harmless, Aventisia
      and its affiliates, officers, employees, and agents from any claims,
      liabilities, damages, losses, or expenses (including legal fees) arising
      from your failure to comply with this policy, including but not limited to
      the unauthorized upload of sensitive personal data.
    </p>
  );
}
