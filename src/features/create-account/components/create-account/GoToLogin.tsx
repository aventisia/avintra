import { ContentFooter } from "@/components/ui/ContentFooter";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { useNavigate } from "react-router-dom";

export const GoToLogin = () => {
  // Get navigate
  const navigate = useNavigate();

  // Return the link to login
  return (
    <ContentFooter>
      <span className="text-sm text-foreground">Have an account?</span>
      <a
        onClick={(e) => {
          e.preventDefault();
          navigate("/login");
        }}
        href={`${import.meta.env.BASE_URL}login`}
        className={buttonVariants({ variant: "link" })}
      >
        Log in
      </a>
    </ContentFooter>
  );
};
