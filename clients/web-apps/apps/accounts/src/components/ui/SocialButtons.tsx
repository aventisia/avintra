import { Button } from "@avplatform/ui/buttons";

interface SocialButtonsProps {
  /** The providers this installation offers */
  providers: { google: boolean; gitHub: boolean };

  /** Called with the client-facing provider name when a button is pressed */
  onProviderClick: (provider: string) => void;

  disabled?: boolean;
}

const SocialButtons = ({ providers, onProviderClick, disabled }: SocialButtonsProps) => {
  return (
    <div className="flex w-full flex-col gap-3 xs:flex-row">
<      {providers.google && (
        <Button
          className="text-md h-11 flex-grow"
          variant="outline"
          disabled={disabled}
          onClick={() => onProviderClick("Google")}
        >
          <img
            className="mr-2.5 h-[1.2rem] w-[1.2rem]"
            src={import.meta.env.BASE_URL + "google_g_logo.svg"}
            alt=""
          />
          Continue with Google
        </Button>
      )}
      {providers.gitHub && (
        <Button
          className="text-md h-11 flex-grow"
          variant="outline"
          disabled={disabled}
          onClick={() => onProviderClick("GitHub")}
        >
          <img
            className="mr-2.5 h-[1.1rem] w-[1.1rem]"
            src={import.meta.env.BASE_URL + "github_logo_black.svg"}
            alt=""
          />
          Continue with GitHub
        </Button>
      )}
    </div>
  );
};

export { SocialButtons };
