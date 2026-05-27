import { useUpgradePlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/upgrade-plan-dialog.store";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { cn } from "@aventisia/ui/lib";
import { Check } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

const ChoosePlanOptions = () => {
  const { setOpen, setChosenPlan } = useUpgradePlanDialogStore(
    useShallow((state) => ({
      setChosenPlan: state.setChosenPlan,
      setOpen: state.setOpen,
    })),
  );

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const isStarterPlan = userSession?.planType == "Starter";
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  return (
    <div className="space-y-5 px-8 py-10 pt-3">
      <h2 className="text-lg font-semibold">Our Deployment Options</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Enterprise Self hosted Plan */}
        <div
          className={cn(
            "col-span-1 grid space-y-4 rounded-lg border",
            !isStarterPlan && "col-span-2",
          )}
        >
          <div className="px-4 pt-4">
            <h3 className="font-semibold">
              Enterprise/Commercial - Self-Hosted
            </h3>
          </div>
          <Separator />
          <div className="grid px-5 pb-4">
            <ul className="space-y-3 text-md">
              <li className="flex items-start gap-2">
                <CheckMark />
                <div>
                  <span className="block font-semibold">
                    Host on Your Infrastructure
                  </span>
                  Deploy Avintra securely within your private cloud or on-premise
                  setup for complete control.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckMark />
                <div>
                  <span className="block font-semibold">
                    Bring Your Own Key Vault
                  </span>
                  Integrate seamlessly with your existing key vault for secure
                  credential and secret management.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckMark />
                <div>
                  <span className="block font-semibold">
                    Connect via Your API Keys
                  </span>
                  Securely integrate with your internal or third-party systems
                  using your own API credentials.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckMark />
                <div>
                  <span className="block font-semibold">
                    Full Environment Separation
                  </span>
                  Includes dedicated Dev, Staging, and Production environments
                  to support enterprise-grade CI/CD and governance.
                </div>
              </li>
            </ul>

            <Button
              className="mt-4 w-full self-end text-md"
              size={"lg"}
              onClick={() => {
                setOpen(false);
                showCustomAlertDialog({
                  confirmActionFn: () => {},
                  confirmBtnText: "Submit Request",
                  description:
                    "Our sales team will get in touch with you shortly.",
                  title: "Enterprise/Commercial – Self-Hosted",
                  isDestructive: false,
                });
              }}
            >
              Choose Plan
            </Button>
          </div>
        </div>

        {/* Pro Plan */}
        {isStarterPlan ? (
          <div className="col-span-1 grid space-y-4 rounded-lg border">
            <div className="px-4 pt-4">
              <h3 className="font-semibold">
                Pro – Aventisia Multi-Tenant Cloud
              </h3>
            </div>
            <Separator />
            <div className="grid px-5 pb-4">
              <ul className="space-y-3 text-md">
                <li className="flex items-start gap-2">
                  <CheckMark />
                  <div>
                    <span className="block font-semibold">
                      Fully Managed by Aventisia
                    </span>
                    Skip the infrastructure hassle — we host, monitor, and
                    manage everything for you.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckMark />
                  <div>
                    <span className="block font-semibold">
                      Secure Key Management
                    </span>
                    Use Aventisia’s multi-tenant key vault, or integrate your
                    own for managing credentials securely.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckMark />
                  <div>
                    <span className="block font-semibold">
                      Use Built-In APIs
                    </span>
                    Access Avintra's powerful APIs for seamless integration with
                    your applications and workflows.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckMark />
                  <div>
                    <span className="block font-semibold">
                      Integrated Environments
                    </span>
                    Dev, Staging, and Production environments come
                    pre-configured for faster deployment and testing cycles.
                  </div>
                </li>
              </ul>

              <Button
                className="w-full self-end text-md"
                size={"lg"}
                onClick={() => setChosenPlan("Pro")}
              >
                Choose Plan
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ChoosePlanOptions;

export const CheckMark = () => {
  return (
    <div className="mt-1 rounded-full bg-green-500 p-[2px]">
      <Check className="h-3 w-3 text-white" />
    </div>
  );
};
