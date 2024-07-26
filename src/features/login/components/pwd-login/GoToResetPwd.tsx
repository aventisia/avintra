import { ContentFooter } from "@/components/ui/ContentFooter";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";

export const GoToResetPwd = () => {
  return (
    <ContentFooter>
      or
      <a
        href={`${import.meta.env.BASE_URL}reset-pwd`}
        className={buttonVariants({ variant: "link" })}
      >
        Reset password
      </a>
    </ContentFooter>
  );
};
