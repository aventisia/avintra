import { LogoImage, LogoLink } from "@avplatform/layout";
import { useBrandLogo } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { useThemeStore } from "@avplatform/ui/stores";

interface AppLogoProps {
  showFullLogo?: boolean;
  iconOnly?: boolean;
  className?: string;
}

const AppLogo = ({ showFullLogo = false, iconOnly = false, className }: AppLogoProps) => {
  const isDark = useThemeStore((state) => state.isDark);
  const brandingLogoUrl = useBrandLogo(showFullLogo ? "company" : "product", !isDark);

  const logoSrcWithBaseUrl = iconOnly
    ? `${import.meta.env.BASE_URL}favicon.svg`
    : (brandingLogoUrl ??
      `${import.meta.env.BASE_URL}${showFullLogo ? (isDark ? "logo_light.svg" : "logo.svg") : isDark ? "app_logo_light.svg" : "app_logo_dark.svg"}`);

  return (
    <LogoLink className="gap-1.5">
      <LogoImage className={cn(className)} src={logoSrcWithBaseUrl} />
    </LogoLink>
  );
};

export { AppLogo };
