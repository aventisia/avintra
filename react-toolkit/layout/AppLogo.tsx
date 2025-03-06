import { cn } from "@/react-toolkit/lib/utils";

interface AppLogoProps {
  /** Set to true, if want to forcefully override app name with AVENTISIA name */
  doNotShowAppName?: boolean;

  /** (Optional): To pass css classes to override style
   *
   * NOTE: Only update font-size (text-) and height (h-) styles using className prop
   */
  className?: string;
}

/** Component to render logo with AVENTISIA or app name text */
const AppLogo = ({
  doNotShowAppName = false,
  className = "h-6 text-xl",
}: AppLogoProps) => {
  return (
    <a
      className={cn(
        "flex items-center justify-center gap-2 font-medium",
        className,
      )}
    >
      <img
        className={cn(className)}
        src={import.meta.env.BASE_URL + "favicon.svg"}
        alt={import.meta.env.VITE_COMPANY_NAME + " Logo"}
      />
      <h1>
        {import.meta.env.VITE_APP_NAME && !doNotShowAppName
          ? import.meta.env.VITE_APP_NAME
          : import.meta.env.VITE_COMPANY_NAME}
      </h1>
    </a>
  );
};

export { AppLogo };
