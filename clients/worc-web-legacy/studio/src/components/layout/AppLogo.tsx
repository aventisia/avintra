import { LogoImage, LogoLink } from "@aventisia/ui/layout";

interface AppLogoProps {
  logoSrc?: string;
}

const AppLogo = (
  { logoSrc }: AppLogoProps, // Optional prop for custom logo source
) => {
  return (
    <LogoLink>
      <LogoImage
        className="h-[1.3rem]"
        src={logoSrc ? logoSrc : "app_logo_light.svg"}
      />
    </LogoLink>
  );
};

export { AppLogo };
