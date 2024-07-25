import { ContentFooter } from "@/components/ui";
import { buttonVariants } from "@/react-toolkit/components/ui";

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
