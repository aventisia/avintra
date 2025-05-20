import { Separator, Switch } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aventisia/ui/cards";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { useLocation, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import Lucide from "@/react-toolkit/ui/Lucide";

import { TenantCrudDialog } from "./tenant-crud-dialog/TenantCrudDialog";

export const TenantInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  return (
    <TenantCrudDialog>
      <div className="flex items-center justify-center">
        <div className="mx-5 w-[60rem] self-center p-10">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between py-4">
                  <p className="text-2xl">Tenant information</p>
                  <Button
                    variant="default"
                    onClick={() => {
                      navigate({
                        pathname: location?.pathname,
                      });
                      if (userSession)
                        setCrudDialogOptions({
                          showDialog: true,
                          rowId: userSession.tenantId,
                          crudAction: "update",
                        });
                    }}
                  >
                    <p className="me-3">Edit</p>
                    <Lucide icon="Pencil" className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <Separator />
              <CardDescription>
                <div className="flex flex-col space-y-2 text-base">
                  <div className="flex justify-between">
                    <p>Tenant Name:</p>
                    <p>Abc</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Tenant Type:</p>
                    <p>Shared</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Idle Session timeout (in minutes):</p>
                    <p>10</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Contract Effective Date:</p>
                    <p>12 March 2025</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Contract Renewal Date:</p>
                    <p>12 March 2026</p>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="my-4" />
              <div className="flex justify-between">
                <div className="flex w-8/12 flex-col">
                  <p className="text-base font-semibold">
                    Required Two Factor Authentication (2FA)
                  </p>
                  <p className="text-pretty text-muted-foreground">
                    if enabled, all users will need an additional verification
                    step (e.g., one time password via email or code from an
                    authenticator app) to log in, enhancing security.
                  </p>
                </div>
                <div className="flex items-center">
                  <Switch disabled />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between">
                <div className="flex w-8/12 flex-col">
                  <p className="text-base font-semibold">
                    Enable Password Login
                  </p>
                  <p className="text-pretty text-muted-foreground">
                    if disabled, users cannot log in using their password.
                  </p>
                </div>
                <div className="flex items-center">
                  <Switch disabled />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between">
                <div className="flex w-8/12 flex-col">
                  <p className="text-base font-semibold">
                    Enable Single Sign-On (SSO)
                  </p>
                  <p className="text-pretty text-muted-foreground">
                    if enabled, users can log in using external authentication
                    provider.
                  </p>
                </div>
                <div className="flex items-center">
                  <Switch disabled />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between">
                <div className="flex w-8/12 flex-col">
                  <p className="text-base font-semibold">
                    Password Never Expires
                  </p>
                  <p className="text-pretty text-muted-foreground">
                    enabling this removes password expiration.
                  </p>
                </div>
                <div className="flex items-center">
                  <Switch disabled />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between">
                <div className="flex w-8/12 flex-col">
                  <p className="text-base font-semibold">
                    Enable Idle Session Timeout
                  </p>
                  <p className="text-pretty text-muted-foreground">
                    if enabled, users sessions will automatically time out after
                    a period of inactivity.
                  </p>
                </div>
                <div className="flex items-center">
                  <Switch disabled />
                </div>
              </div>
              <Separator className="my-4" />
            </CardContent>
            <CardFooter className="px-5 py-8"></CardFooter>
          </Card>
        </div>
      </div>
    </TenantCrudDialog>
  );
};
