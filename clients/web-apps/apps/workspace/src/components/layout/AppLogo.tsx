import { LogoImage, LogoLink } from "@avplatform/layout";
import { useBrandLogo } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";

interface AppLogoProps {
  logoSrc?: string;
  showFullLogo?: boolean;
  className?: string;
}

const AppLogo = ({ logoSrc, showFullLogo = false, className }: AppLogoProps) => {
  const brandingLogoUrl = useBrandLogo(showFullLogo ? "company" : "product");

  const logoSrcWithBaseUrl =
    brandingLogoUrl ??
    (logoSrc
      ? `${import.meta.env.BASE_URL}${logoSrc.toLowerCase()}`
      : `${import.meta.env.BASE_URL}${showFullLogo ? "logo.svg" : "app_logo_light.svg"}`);

  return (
    <LogoLink className="gap-1.5">
      <LogoImage className={cn(className)} src={logoSrcWithBaseUrl} />
    </LogoLink>
  );
};

export { AppLogo };
