import { useCreateAccountStore } from "@/features/create-account";
import { ContentFooter } from "@/components/ui";
import { Button } from "@/react-toolkit/components/ui";
import { useShallow } from "zustand/react/shallow";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export const BackToCreateAccount = () => {
  // Get store state and actions
  const { setStepNo } = useCreateAccountStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
    })),
  );

  return (
    <ContentFooter>
      <Button
        className="h-0 p-0 font-normal"
        variant={"link"}
        onClick={() => setStepNo(1)}
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="ml-1">Back to create account</span>
      </Button>
    </ContentFooter>
  );
};
