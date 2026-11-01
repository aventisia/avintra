import { Button } from "@avplatform/ui/buttons";
import { ArrowRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { useAllowedRoutesStore } from "@/stores/allowed-routes-auth-store";

import { RUNNER_COMMANDS, RUNNER_INSTALL_SECTION_ID } from "../constants/desktop-download.constant";
import { useRunnerInstallCommand } from "../hooks/useRunnerInstallCommand.hook";
import { CommandBlock } from "./CommandBlock";

const API_KEYS_ROUTE = "/orchestrator/api-keys";

const Kbd = ({ children }: { children: ReactNode }) => (
  <span className="font-medium text-ink-2">{children}</span>
);

const InstallStep = ({
  number,
  title,
  isLast,
  children,
}: {
  number: number;
  title: string;
  isLast: boolean;
  children: ReactNode;
}) => (
  <li className="relative grid grid-cols-[1.75rem_minmax(0,1fr)] gap-4 pb-8 last:pb-0">
    {!isLast && (
      <span aria-hidden="true" className="absolute bottom-1 left-[13.5px] top-9 w-px bg-line" />
    )}
    <span className="grid size-7 place-items-center rounded-full border border-line bg-surface font-mono text-hint text-ink-2">
      {number}
    </span>
    <div className="min-w-0 space-y-3 pt-0.5">
      <h3 className="text-body font-medium text-ink">{title}</h3>
      {children}
    </div>
  </li>
);

const Requirements = () => (
  <aside className="self-start rounded-lg border border-line bg-sunken p-5 lg:sticky lg:top-6">
    <h3 className="text-label uppercase text-muted-foreground">Before you start</h3>
    <ul className="mt-3 space-y-3 text-body-sm text-ink-2">
      <li>Windows 10, Windows 11 or Windows Server</li>
      <li>An administrator account on the machine</li>
      <li>An API key with the Machine authentication permission</li>
      <li>
        Network access to <span className="font-mono text-code">{window.location.host}</span>
      </li>
    </ul>
  </aside>
);

/** Numbered guide for provisioning the Runner app as a Windows service. */
export const RunnerInstallGuide = () => {
  const navigate = useNavigate();
  const installCommand = useRunnerInstallCommand();
  const canOpenApiKeys = useAllowedRoutesStore((state) =>
    state.allowedRoutes.includes(API_KEYS_ROUTE),
  );

  const steps = [
    {
      title: "Open PowerShell as administrator",
      body: (
        <p className="text-body-sm text-muted-foreground">
          Press the <Kbd>Windows key</Kbd>, type <Kbd>PowerShell</Kbd>, right-click{" "}
          <Kbd>Windows PowerShell</Kbd> and choose <Kbd>Run as administrator</Kbd>.
        </p>
      ),
    },
    {
      title: "Allow local scripts",
      body: (
        <>
          <p className="text-body-sm text-muted-foreground">
            PowerShell blocks unsigned scripts by default. Run this once in the same window.
          </p>
          <CommandBlock command={RUNNER_COMMANDS.allowScripts} />
        </>
      ),
    },
    {
      title: "Get an API key",
      body: (
        <>
          <p className="text-body-sm text-muted-foreground">
            The runner signs in with an API key that has the Machine authentication permission.
            Anyone with the Orchestrator manager role can create one.
          </p>
          {canOpenApiKeys && (
            <Button variant="outline" size="sm" onClick={() => navigate(API_KEYS_ROUTE)}>
              Open API keys
              <ArrowRightIcon className="size-3.5" />
            </Button>
          )}
        </>
      ),
    },
    {
      title: "Run the install command",
      body: (
        <>
          <p className="text-body-sm text-muted-foreground">
            Replace the highlighted <span className="font-mono text-code">&lt;API_KEY&gt;</span>{" "}
            with your key, then run it. It downloads the runner, registers it as a Windows service
            and starts it. Your workspace address, tenant and username are already filled in.
          </p>
          <CommandBlock command={installCommand} />
        </>
      ),
    },
    {
      title: "Check that it's running",
      body: (
        <>
          <p className="text-body-sm text-muted-foreground">
            The second command should report the service as <Kbd>RUNNING</Kbd>.
          </p>
          <CommandBlock command={RUNNER_COMMANDS.verify} />
        </>
      ),
    },
  ];

  return (
    <section id={RUNNER_INSTALL_SECTION_ID} className="scroll-mt-6">
      <h2 className="text-heading text-ink">Install the Runner app</h2>
      <p className="mt-1.5 text-body-sm text-muted-foreground">
        A few minutes in an administrator PowerShell window. No other runtime is needed.
      </p>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <ol>
          {steps.map(({ title, body }, index) => (
            <InstallStep
              key={title}
              number={index + 1}
              title={title}
              isLast={index === steps.length - 1}
            >
              {body}
            </InstallStep>
          ))}
        </ol>
        <Requirements />
      </div>
    </section>
  );
};
