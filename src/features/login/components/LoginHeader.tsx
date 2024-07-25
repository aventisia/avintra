import { HeaderContainer } from "@/components/layout";
import { AppLogo } from "@/react-toolkit/components/layout";
import { buttonVariants } from "@/react-toolkit/components/ui";
import { cn } from "@/react-toolkit/lib";

export const LoginHeader = () => {
  return (
    <HeaderContainer>
      <AppLogo />
      <a
        href="/help?id=login"
        className={cn(buttonVariants({ variant: "link" }), "text-right")}
      >
        Help?
      </a>
    </HeaderContainer>
  );
};
