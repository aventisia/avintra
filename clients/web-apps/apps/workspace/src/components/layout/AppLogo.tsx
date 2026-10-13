import { LogoImage, LogoLink } from "@avplatform/layout";
import { useBranding } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";

interface AppLogoProps {
  logoSrc?: string;
  className?: string;
}

const AppLogo = (
  { logoSrc, className }: AppLogoProps, // Optional prop for custom logo source
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
    <LogoLink>
      <LogoImage className={cn(className)} src={logoSrcWithBaseUrl} />
    </LogoLink>
  );
};

export { AppLogo };
