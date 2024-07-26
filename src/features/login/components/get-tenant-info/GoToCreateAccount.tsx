import { ContentFooter } from "@/components/ui/ContentFooter";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";

export const GoToCreateAccount = () => {
  return (
    <ContentFooter className="flex-col mlg:flex-row">
      Don't have an account?
      <a
        href={`${import.meta.env.BASE_URL}create-account`}
        className={buttonVariants({ variant: "link" })}
      >
        Create free account
      </a>
    </ContentFooter>
  );
};
