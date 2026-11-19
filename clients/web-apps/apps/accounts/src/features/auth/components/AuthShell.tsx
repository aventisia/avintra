import { AppLogo } from "@avplatform/layout/logo";
import { MinimalFooter } from "@avplatform/layout/minimal-footer";
import { IS_TAURI } from "@avplatform/ui/constants";

import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { TauriAppFooter } from "@/components/layout/TauriAppFooter";
import { LeftContainer } from "@/components/ui/LeftContainer";
import { PageContainer } from "@/components/ui/PageContainer";
import { RightContainer, type RightContainerProps } from "@/components/ui/RightContainer";

type AuthShellProps = React.PropsWithChildren<{
  /** The story panel beside the form; the sign-in story when omitted */
  panel?: RightContainerProps;
}>;

/** The two-column frame of every sign-in, sign-up and reset screen. */
const AuthShell = ({ panel = {}, children }: AuthShellProps) => {
  return (
    <PageContainer>
      <LeftContainer>
        <HeaderContainer>
          <AppLogo showFullLogo={true} className="h-7" />
        </HeaderContainer>
        {children}
        {IS_TAURI ? <TauriAppFooter /> : <MinimalFooter />}
      </LeftContainer>
      <RightContainer {...panel} />
    </PageContainer>
  );
};

export { AuthShell };
