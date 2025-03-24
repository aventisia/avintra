import { cn } from "@/react-toolkit/lib/utils";

interface AppLogoProps {
  /** Set to true, if want to show full logo */
  showFullLogo?: boolean;

  /** (Optional): To pass css classes to override style
   *
   * NOTE: Only update font-size (text-) and height (h-) styles using className prop
   */
  className?: string;
}

/** Component to render logo without app name or with app name */
const AppLogo = ({
  showFullLogo = false,
  className = "h-6 text-xl",
}: AppLogoProps) => {
  // Logo path
  const logoSrc = showFullLogo
    ? import.meta.env.BASE_URL + "logo.svg"
    : import.meta.env.BASE_URL + "favicon.svg";

  // Return logo with app name
  return (
    <a
      href={import.meta.env.BASE_URL}
      className={cn(
        "flex items-center justify-center gap-2 font-medium",
        className,
      )}
    >
      <img
        className={cn(className)}
        src={logoSrc}
        alt={import.meta.env.VITE_COMPANY_NAME + " Logo"}
      />
      {import.meta.env.VITE_APP_NAME && !showFullLogo && (
        <h1>{import.meta.env.VITE_APP_NAME}</h1>
      )}
    </a>
  );
};

export { AppLogo };
