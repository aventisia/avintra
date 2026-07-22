import { Button } from "@avplatform/ui/buttons";

const SocialButtons = () => {
  return (
    <div className="flex w-full flex-col gap-3 xs:flex-row">
      <Button className="text-md h-11 flex-grow" variant="outline">
        <img
          className="mr-2.5 h-[1.2rem] w-[1.2rem]"
          src={import.meta.env.BASE_URL + "google_g_logo.svg"}
          alt="Google logo"
        />
        Google
      </Button>
      <Button className="text-md h-11 flex-grow" variant="outline">
        <img
          className="mr-2.5 h-[1.1rem] w-[1.1rem]"
          src={import.meta.env.BASE_URL + "github_logo_black.svg"}
          alt="Github logo"
        />
        Github
      </Button>
    </div>
  );
};

export { SocialButtons };
