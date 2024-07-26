import { ContentFooter } from "@/components/ui/ContentFooter";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";

export const GoToLogin = () => {
  return (
    <ContentFooter>
      <span className="text-sm text-foreground">Have an account?</span>
      <a
        href={`${import.meta.env.BASE_URL}login`}
        className={buttonVariants({ variant: "link" })}
      >
        Log in
      </a>
    </ContentFooter>
  );
};
