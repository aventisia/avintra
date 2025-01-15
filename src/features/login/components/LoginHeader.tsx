import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";

export const LoginHeader = () => {
  return (
    <HeaderContainer>
      <AppLogo />
      <a
        href="/help?id=login"
        className={cn(buttonVariants({ variant: "link" }), "text-right text-md")}
      >
        Help?
      </a>
    </HeaderContainer>
  );
};
