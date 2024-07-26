import { ContentFooter } from "@/components/ui/ContentFooter";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export const BackToLogin = () => {
  // Get navigate function
  const navigate = useNavigate();

  // Return button
  return (
    <ContentFooter>
      <Button
        className="h-0 p-0 font-normal"
        variant={"link"}
        onClick={() => navigate("/login")}
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="ml-2">Back to log in</span>
      </Button>
    </ContentFooter>
  );
};
