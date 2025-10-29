import CustomRadioItem from "@/components/ui/CustomRadioItem";
import { useCompanyInfoStore } from "@/features/on-boarding/stores/company-info-store";

import { Button } from "@aventisia/ui/buttons";
import { RadioGroup } from "@aventisia/ui/radio-group";
import { Building2, User } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { ContentContainer } from "../ContentContainer";
import { ContentHeader } from "../ContentHeader";

export default function UserTypeSelection() {
  const { setStepNo, userType, setUserType } = useCompanyInfoStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      userType: state.userType,
      setUserType: state.setUserType,
    })),
  );

  const handleProceed = () => {
    if (userType) {
      if (userType == "organization") setStepNo(2);
      else setStepNo(3);
    }
  };

  return (
    <ContentContainer className="fadeInRTL">
      {/* Header */}
      <ContentHeader
        biggerHeading="Tell us about yourself"
        smallerHeading="Choose the type of account that best fits you."
      />

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
          <div className="font-semibold text-md text-gray-900">Individual</div>
          <span className="font-normal leading-3.5 text-muted-foreground">
            For personal use or managing your own projects.
          </span>
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
          <div className="font-semibold text-md text-gray-900">
            Organization
          </div>
          <span className="font-normal leading-3.5 text-muted-foreground ">
            For companies, teams, or groups managing multiple users.
          </span>
        </CustomRadioItem>
      </RadioGroup>

      {/* Proceed Button */}
      <Button
        className="w-full mt-5"
        onClick={handleProceed}
        disabled={!userType}
      >
        Continue
      </Button>
    </ContentContainer>
  );
}
