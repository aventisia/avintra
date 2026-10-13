import { useBranding } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";

interface AppLogoProps {
  /** Set to true, if want to show aventisia logo */
  showFullLogo?: boolean;

  /** Set to true, if want to show light logo */
  lightLogo?: boolean;

  /** (Optional): To pass css classes to override style
   *
   * NOTE: Only update height (h-) styles using className prop
   */
  className?: string;
}

/** Component to render logo without app name or with app name */
const AppLogo = ({
  showFullLogo = false,
  lightLogo = true,
  className = "h-6 text-xl",
}: AppLogoProps) => {
  const branding = useBranding();

  // Logo file
  const logoFile = lightLogo ? "app_logo_light.svg" : "app_logo_dark.svg";

  // A configured deployment branding logo overrides the built-in asset. The full wordmark uses its
  // own asset when configured and otherwise reuses the compact logo.
  const brandingLogoUrl = showFullLogo
    ? (branding.fullLogoUrl ?? branding.logoUrl)
    : branding.logoUrl;

  // Logo path
  const logoSrc =
    brandingLogoUrl ?? import.meta.env.BASE_URL + (showFullLogo ? "logo.svg" : logoFile);

  // Return logo with app name
  return (
    <a
      href={import.meta.env.BASE_URL}
      className={cn("flex items-center justify-center gap-2 font-medium", className)}
    >
      <img className={cn(className)} src={logoSrc} alt="Logo" />
    </a>
  );
};

export { AppLogo };
