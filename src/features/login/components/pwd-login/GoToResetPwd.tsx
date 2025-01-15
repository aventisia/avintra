import { ContentFooter } from "@/components/ui/ContentFooter";
import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { useNavigate } from "react-router-dom";

export const GoToResetPwd = () => {
  // Get navigate
  const navigate = useNavigate();

  // Return the link to reset password
  return (
    <ContentFooter>
      or
      <a
        onClick={(e) => {
          e.preventDefault();
          navigate("/reset-pwd");
        }}
        href={`${import.meta.env.BASE_URL}reset-pwd`}
        className={cn(buttonVariants({ variant: "link" }), "text-md")}
      >
        Reset password
      </a>
    </ContentFooter>
  );
};
