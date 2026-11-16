import { useBrandLogo } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { useThemeStore } from "@avplatform/ui/stores";

interface AppLogoProps {
  /** Set to true to show the full company logo instead of the compact product logo. */
  showFullLogo?: boolean;

  /** (Optional): To pass css classes to override style
   *
   * NOTE: Only update height (h-) styles using className prop
   */
  className?: string;
}

/** Component to render the deployment logo, falling back to the built-in asset. */
const AppLogo = ({ showFullLogo = false, className = "h-6 text-xl" }: AppLogoProps) => {
  const isDark = useThemeStore((state) => state.isDark);
  const brandingLogoUrl = useBrandLogo(showFullLogo ? "company" : "product", !isDark);

  const fullLogoFile = isDark ? "logo_light.svg" : "logo.svg";
  const logoFile = isDark ? "app_logo_light.svg" : "app_logo_dark.svg";
  const logoSrc =
    brandingLogoUrl ?? import.meta.env.BASE_URL + (showFullLogo ? fullLogoFile : logoFile);

  return (
    <a
      href={import.meta.env.BASE_URL}
      className={cn("flex items-center gap-2.5 font-semibold tracking-[-0.02em]", className)}
    >
      <img className={cn("w-auto shrink-0", className)} src={logoSrc} alt="Logo" />
    </a>
  );
};

export { AppLogo };
