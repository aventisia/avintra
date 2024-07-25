import { buttonVariants } from "@/react-toolkit/components/ui";
import { cn } from "@/react-toolkit/lib";

export const TermsAndConditionsLabel = () => {
  return (
    <p className="mt-[0.5px] text-sm font-normal">
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
