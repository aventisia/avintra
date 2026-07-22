import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";

import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { AppLogo } from "@/react-toolkit/layout/AppLogo";

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
