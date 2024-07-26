import { ContentFooter } from "@/components/ui/ContentFooter";
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
        className={buttonVariants({ variant: "link" })}
      >
        Reset password
      </a>
    </ContentFooter>
  );
};
