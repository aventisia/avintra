import { ContentFooter } from "@/components/ui";
import { buttonVariants } from "@/react-toolkit/components/ui";

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
