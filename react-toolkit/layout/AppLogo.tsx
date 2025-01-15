import { cn } from "@/react-toolkit/lib/utils";

interface AppLogoProps {
  /** Set to true, if want to forcefully hide app name */
  doNotShowAppName?: boolean;

  /** (Optional): To pass css classes to override style
   *
   * NOTE: Only update font-size (text-) and height (h-) styles using className prop
   */
  className?: string;
}

/** Component to render logo without app name or with app name */
const AppLogo = ({
  doNotShowAppName = false,
  className = "h-7 text-xl",
}: AppLogoProps) => {
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
        src={import.meta.env.BASE_URL + "logo.svg"}
        alt={import.meta.env.VITE_COMPANY_NAME + " Logo"}
      />
      {import.meta.env.VITE_APP_NAME && !doNotShowAppName && (
        <h1>{import.meta.env.VITE_APP_NAME}</h1>
      )}
    </a>
  );
};

export { AppLogo };
