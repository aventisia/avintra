import { LogoImage, LogoLink } from "@avplatform/layout";
import { useBranding } from "@avplatform/ui/hooks";

interface AppLogoProps {
  logoSrc?: string;
}

const AppLogo = (
  { logoSrc }: AppLogoProps, // Optional prop for custom logo source
) => {
  const branding = useBranding();

  // A configured deployment branding logo overrides the provided/default asset. Light/dark
  // variants are not differentiated yet, so the same branded logo is used for both.
  const logoSrcWithBaseUrl =
    branding.logoUrl ??
    (logoSrc
      ? `${import.meta.env.BASE_URL}${logoSrc.toLowerCase()}`
      : `${import.meta.env.BASE_URL}app_logo_light.svg`);

  return (
    <LogoLink className="shrink-0">
      <LogoImage className="h-[1.3rem] shrink-0" src={logoSrcWithBaseUrl} />
    </LogoLink>
  );
};

export { AppLogo };
