import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";

export const LoginHeader = () => {
  return (
    <HeaderContainer>
      <AppLogo showFullLogo={true} className="h-7" />
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
