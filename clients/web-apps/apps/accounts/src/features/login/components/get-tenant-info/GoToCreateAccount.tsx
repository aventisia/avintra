import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { useNavigate } from "react-router-dom";

import { ContentFooter } from "@/components/ui/ContentFooter";

export const GoToCreateAccount = () => {
  // Get navigate
  const navigate = useNavigate();

  // Return the link to create account
  return (
    <ContentFooter className="flex-col mlg:flex-row">
      Don't have an account?
      <a
        onClick={(e) => {
          e.preventDefault();
          navigate("/create-account");
        }}
        href={`${import.meta.env.BASE_URL}create-account`}
        className={cn(buttonVariants({ variant: "link" }), "text-md")}
      >
        Create free account
      </a>
    </ContentFooter>
  );
};
