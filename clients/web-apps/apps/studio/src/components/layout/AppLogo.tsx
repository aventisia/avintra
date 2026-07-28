import { LogoImage, LogoLink } from "@avplatform/layout";

interface AppLogoProps {
  logoSrc?: string;
}

const AppLogo = (
  { logoSrc }: AppLogoProps, // Optional prop for custom logo source
) => {
  const logoSrcWithBaseUrl = logoSrc
    ? `${import.meta.env.BASE_URL}${logoSrc.toLowerCase()}`
    : `${import.meta.env.BASE_URL}app_logo_light.svg`;

  return (
    <LogoLink>
      <LogoImage
        className="h-[1.3rem]"
        src={logoSrcWithBaseUrl}
      />
    </LogoLink>
  );
};

export { AppLogo };
