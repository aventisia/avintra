import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";

export const TermsAndConditionsLabel = () => {
  return (
    <p className="text-md mt-[0.5px] font-normal">
      I agree to the{" "}
      <a
        href="/help?id=create-account"
        className={cn(buttonVariants({ variant: "link" }))}
      >
        Terms & Conditions
      </a>
    </p>
  );
};
