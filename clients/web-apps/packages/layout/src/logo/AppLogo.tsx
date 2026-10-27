import { useBrandLogo } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";

interface AppLogoProps {
  /** Set to true to show the full company logo instead of the compact product logo. */
  showFullLogo?: boolean;

  /** Set to true to use the light built-in asset. */
  lightLogo?: boolean;

  /** (Optional): To pass css classes to override style
   *
   * NOTE: Only update height (h-) styles using className prop
   */
  className?: string;
}

/** Component to render the deployment logo, falling back to the built-in asset. */
const AppLogo = ({
  showFullLogo = false,
  lightLogo = true,
  className = "h-6 text-xl",
}: AppLogoProps) => {
  const brandingLogoUrl = useBrandLogo(showFullLogo ? "company" : "product", lightLogo);

  const logoFile = lightLogo ? "app_logo_light.svg" : "app_logo_dark.svg";
  const logoSrc =
    brandingLogoUrl ?? import.meta.env.BASE_URL + (showFullLogo ? "logo.svg" : logoFile);

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
