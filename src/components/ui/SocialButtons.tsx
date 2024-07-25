import { Button } from "@/react-toolkit/components/ui";

const SocialButtons = () => {
  return (
    <div className="flex w-full flex-col space-x-0 space-y-3 xs:flex-row xs:space-x-3 xs:space-y-0">
      <Button className="flex-grow basis-0" variant="outline">
        <img
          className="mr-2.5 h-[1.2rem] w-[1.2rem]"
          src={import.meta.env.BASE_URL + "google_g_logo.svg"}
          alt="Google logo"
        />
        Google
      </Button>
      <Button className="flex-grow basis-0" variant="outline">
        <img
          className="mr-2.5 h-[1.1rem] w-[1.1rem]"
          src={import.meta.env.BASE_URL + "microsoft_logo.svg"}
          alt="Microsoft logo"
        />
        Microsoft
      </Button>
      <Button className="flex-grow basis-0" variant="outline">
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
