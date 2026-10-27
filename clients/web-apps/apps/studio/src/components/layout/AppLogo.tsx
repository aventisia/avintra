import { LogoImage, LogoLink } from "@avplatform/layout";
import { useBrandLogo } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { useThemeStore } from "@avplatform/ui/stores";

interface AppLogoProps {
  showFullLogo?: boolean;
  className?: string;
  label?: string;
}

const AppLogo = ({ showFullLogo = false, className, label }: AppLogoProps) => {
  const isDark = useThemeStore((state) => state.isDark);
  const brandingLogoUrl = useBrandLogo(showFullLogo ? "company" : "short", !isDark);

  const logoSrcWithBaseUrl =
    brandingLogoUrl ??
    `${import.meta.env.BASE_URL}${showFullLogo ? (isDark ? "logo_light.svg" : "logo.svg") : isDark ? "app_logo_light.svg" : "app_logo_dark.svg"}`;

  return (
    <LogoLink className="shrink-0 gap-1.5">
      <LogoImage className={cn("h-[1.3rem] shrink-0", className)} src={logoSrcWithBaseUrl} />
      {label ? (
        <span className="translate-y-px font-sans text-[clamp(0.8125rem,0.55vw_+_0.45rem,1rem)] leading-none font-semibold tracking-normal whitespace-nowrap text-ink [word-spacing:0.05em]">
          {label}
        </span>
      ) : null}
    </LogoLink>
  );
};

export { AppLogo };
