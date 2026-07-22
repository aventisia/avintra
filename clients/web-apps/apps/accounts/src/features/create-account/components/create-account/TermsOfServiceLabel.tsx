import { buttonVariants } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";

export const TermsOfServiceLabel = () => {
  return (
    <p className="text-md -mt-[0.16rem] font-normal">
      I acknowledge and accept the{" "}
      <a
        href={`${import.meta.env.VITE_MARKETING_URL}/terms-of-service`}
        className={cn(buttonVariants({ variant: "link" }))}
      >
        Terms of Service
      </a>
    </p>
  );
};
