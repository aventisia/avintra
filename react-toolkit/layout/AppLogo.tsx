import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

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
    <div className="flex items-center gap-1.5">
      <Tooltip content="Back">
        <Button
          size="icon8"
          variant="ghost"
          className="hover:bg-white/10"
          onClick={() => window.history.back()}
        >
          <ArrowLeftIcon className="h-4 w-4 text-white/80" />
        </Button>
      </Tooltip>
      <img className={cn(className)} src={logoSrc} alt="Logo" />
    </div>
  );
};

export { AppLogo };
