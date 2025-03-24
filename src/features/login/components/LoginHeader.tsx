import AccountsAppLogo from "@/components/layout/AccountsAppLogo";
import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";

export const LoginHeader = () => {
  return (
    <HeaderContainer>
      <AccountsAppLogo />
      <a
        href="/help?id=login"
        className={cn(
          buttonVariants({ variant: "link" }),
          "text-right text-md",
          "hidden", // TODO: Hide the help link till we have a docs app
        )}
      >
        Help?
      </a>
    </HeaderContainer>
  );
};
