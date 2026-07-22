import { ContentFooter } from "@/components/ui/ContentFooter";

import { Button } from "@aventisia/ui/buttons";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useResetPwdStore } from "../stores/reset-pwd-store";

export const BackToLogin = () => {
  // Get navigate function
  const navigate = useNavigate();

  // Get store state and actions
  const { setStepNo } = useResetPwdStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
    })),
  );

  // Return button
  return (
    <ContentFooter>
      <Button
        className="text-md h-0 p-0 font-normal"
        variant={"link"}
        onClick={() => {
          setStepNo(1);
          navigate("/login");
        }}
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="ml-2">Back to log in</span>
      </Button>
    </ContentFooter>
  );
};
