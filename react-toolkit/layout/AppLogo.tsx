import { cn } from "@aventisia/ui/lib";

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
  // Logo file
  const logoFile = lightLogo ? "app_logo_light.svg" : "app_logo_dark.svg";

  // Logo path
  const logoSrc = showFullLogo
    ? import.meta.env.BASE_URL + "logo.svg"
    : import.meta.env.BASE_URL + logoFile;

  // Return logo with app name
  return (
    <a
      href={import.meta.env.BASE_URL}
      className={cn(
        "flex items-center justify-center gap-2 font-medium",
        className,
      )}
    >
      <img className={cn(className)} src={logoSrc} alt="Logo" />
    </a>
  );
};

export { AppLogo };
