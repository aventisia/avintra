import CustomRadioItem from "@/components/ui/CustomRadioItem";
import { useUpdateTenantInfoMutation } from "@/features/sign-up/hooks/useUpdateTenantInfoMutation";
import { useCompanyInfoStore } from "@/features/sign-up/stores/company-info-store";
import { USER_NAME_LS_KEY } from "@/react-toolkit/constants";
import { useCarryParams } from "@/react-toolkit/hooks/useForwardQueryParams";

import { Button } from "@aventisia/ui/buttons";
import { RadioGroup } from "@aventisia/ui/radio-group";
import { Building2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { ContentHeader } from "../ContentHeader";

export default function UserTypeSelection() {
  const navigate = useNavigate();

  const withQueryParams = useCarryParams(["plan", "currency", "frequency"]);

  const { setStepNo, userType, setUserType } = useCompanyInfoStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      userType: state.userType,
      setUserType: state.setUserType,
    })),
  );

  const { isCreationPending, updateTenantInfoMutation } =
    useUpdateTenantInfoMutation();

  const onSubmit = async () => {
    try {
      await updateTenantInfoMutation({
        domain: localStorage.getItem(USER_NAME_LS_KEY)?.split("@")[1] ?? "",
        organizationName: localStorage.getItem(USER_NAME_LS_KEY) ?? "",
      });

      setTimeout(() => {
        navigate(withQueryParams("/choose-plan"));
      }, 300);
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
    }
  };

  const handleProceed = () => {
    if (userType) {
      if (userType == "organization") setStepNo(2);
      else onSubmit();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <ContentHeader
          biggerHeading="Thank you for signing up!"
          smallerHeading="Tell us who you are to get started"
        />
      </div>

      {/* Radio Group */}
      <RadioGroup
        value={userType}
        onValueChange={setUserType}
        className="flex w-full"
      >
        <CustomRadioItem
          value="individual"
          selected={userType}
          className="flex flex-col items-center justify-center space-y-2 text-center py-14"
        >
          <div className="bg-slate-100 p-2 rounded-lg">
            <User
              className={`w-7 h-7 ${
                userType === "individual"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </div>
          <div className="font-medium text-gray-900">Individual</div>
        </CustomRadioItem>

        <CustomRadioItem
          value="organization"
          selected={userType}
          className="flex flex-col items-center justify-center space-y-2 text-center py-14"
        >
          <div className="bg-slate-100 p-2 rounded-lg">
            <Building2
              className={`w-7 h-7 ${
                userType === "organization"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </div>
          <div className="font-medium text-gray-900">Organization</div>
        </CustomRadioItem>
      </RadioGroup>

      {/* Proceed Button */}
      <Button
        className="w-full mt-5"
        onClick={handleProceed}
        disabled={!userType || isCreationPending}
      >
        Continue
      </Button>
    </div>
  );
}
