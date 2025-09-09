import { Switch } from "@aventisia/ui";

const Preferences = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between rounded-lg border p-4">
        <div className="flex w-8/12 flex-col">
          <p className="text-base font-semibold">
            Required Two Factor Authentication (2FA)
          </p>
          <p className="text-md text-pretty text-muted-foreground">
            if enabled, all users will need an additional verification step
            (e.g., one time password via email or code from an authenticator
            app) to log in, enhancing security.
          </p>
        </div>
        <div className="flex items-center">
          <Switch disabled />
        </div>
      </div>

      <div className="flex justify-between rounded-lg border p-4">
        <div className="flex w-8/12 flex-col">
          <p className="text-base font-semibold">Enable Password Login</p>
          <p className="text-md text-pretty text-muted-foreground">
            if disabled, users cannot log in using their password.
          </p>
        </div>
        <div className="flex items-center">
          <Switch disabled />
        </div>
      </div>

      <div className="flex justify-between rounded-lg border p-4">
        <div className="flex w-8/12 flex-col">
          <p className="text-base font-semibold">Enable Single Sign-On (SSO)</p>
          <p className="text-md text-pretty text-muted-foreground">
            if enabled, users can log in using external authentication provider.
          </p>
        </div>
        <div className="flex items-center">
          <Switch disabled />
        </div>
      </div>

      <div className="flex justify-between rounded-lg border p-4">
        <div className="flex w-8/12 flex-col">
          <p className="text-base font-semibold">Password Never Expires</p>
          <p className="text-md text-pretty text-muted-foreground">
            enabling this removes password expiration.
          </p>
        </div>
        <div className="flex items-center">
          <Switch disabled />
        </div>
      </div>

      <div className="flex justify-between rounded-lg border p-4">
        <div className="flex w-8/12 flex-col">
          <p className="text-base font-semibold">Enable Idle Session Timeout</p>
          <p className="text-md text-pretty text-muted-foreground">
            if enabled, users sessions will automatically time out after a
            period of inactivity.
          </p>
        </div>
        <div className="flex items-center">
          <Switch disabled />
        </div>
      </div>
    </div>
  );
};

export default Preferences;
