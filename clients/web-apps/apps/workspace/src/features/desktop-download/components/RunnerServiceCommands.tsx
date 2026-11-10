import { RUNNER_COMMANDS } from "../constants/desktop-download.constant";
import { CommandBlock } from "./CommandBlock";

const SERVICE_TASKS = [
  {
    title: "Restart",
    description: "Picks up configuration changes or recovers a stuck runner.",
    command: RUNNER_COMMANDS.restart,
  },
  {
    title: "Stop",
    description: "Published agents stop running on this machine until you start it again.",
    command: RUNNER_COMMANDS.stop,
  },
  {
    title: "Uninstall",
    description: "Removes the Windows service and deletes its files.",
    command: RUNNER_COMMANDS.uninstall,
  },
];

/** Maintenance commands for an installed Runner app service. */
export const RunnerServiceCommands = () => (
  <section>
    <h2 className="text-heading text-ink">Manage the service</h2>
    <p className="mt-1.5 text-body-sm text-muted-foreground">
      Run these from an administrator PowerShell window. To update, run the install command again;
      it stops the service, replaces the files with the latest version and starts it.
    </p>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {SERVICE_TASKS.map(({ title, description, command }) => (
        <div
          key={title}
          className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-5 last:md:col-span-2"
        >
          <div>
            <h3 className="text-body font-medium text-ink">{title}</h3>
            <p className="mt-0.5 text-hint text-muted-foreground">{description}</p>
          </div>
          <CommandBlock command={command} />
        </div>
      ))}
    </div>
  </section>
);
