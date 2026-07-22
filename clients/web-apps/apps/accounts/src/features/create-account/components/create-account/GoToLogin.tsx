import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { useNavigate } from "react-router-dom";

import { ContentFooter } from "@/components/ui/ContentFooter";

export const GoToLogin = () => {
  // Get navigate
  const navigate = useNavigate();

  // Return the link to login
  return (
    <ContentFooter>
      <span className="text-md text-foreground">Have an account?</span>
      <a
        onClick={(e) => {
          e.preventDefault();
          navigate("/login");
        }}
        href={`${import.meta.env.BASE_URL}login`}
        className={cn(buttonVariants({ variant: "link" }), "text-md")}
      >
        Log in
      </a>
    </ContentFooter>
  );
};
