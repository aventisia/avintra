import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@avplatform/ui/accordion";
import { Button, CopyButton } from "@avplatform/ui/buttons";
import { DialogTitle } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { Monitor, Terminal } from "lucide-react";
import React, { useMemo, useState } from "react";
import { FaApple, FaWindows } from "react-icons/fa";
import { SiLinux } from "react-icons/si";
import { useShallow } from "zustand/react/shallow";

import type { ArtifactDto, ProductManifestDto } from "../dtos/download-manifest.dto";
import { useDesktopDownloadManifest } from "../hooks/useDesktopDownloads.hook";
import { type Platform, detectPlatform } from "../utils/detect-platform.util";

// TODO: Replace with the desktop-app release notes URL once the desktop-app
// repository is published and releases are tagged there.
const RELEASE_NOTES_URL = "https://github.com/aventisia/avintra-platform/releases";

const buildOllamaStylePowerShellCommand = (
  baseUrl: string,
  scriptUrl: string,
  tenantId: string | undefined,
  linkedUsername: string | undefined,
) => {
  const appBaseUrl = baseUrl.replace(/\/$/, "");
  const t = tenantId ?? "<TENANT_ID>";
  const u = linkedUsername ?? "<LINKED_USERNAME>";
  return [
    `$env:AVINTRA_APP_BASE_URL = "${appBaseUrl}"`,
    '$env:AVINTRA_API_KEY = "<API_KEY>"',
    `$env:AVINTRA_TENANT_ID = "${t}"`,
    `$env:AVINTRA_LINKED_USERNAME = "${u}"`,
    `$scriptPath = Join-Path $env:TEMP "Install-AvintraRunnerService.ps1"`,
    `irm "${scriptUrl}" -OutFile $scriptPath`,
    `& $scriptPath`,
  ].join("\n");
};

const PLATFORM_LABELS: Record<Platform, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
};

const getArtifactForPlatform = (
  product: ProductManifestDto,
  platform: Platform,
): ArtifactDto | undefined => {
  const targetVersion = product.versions.find((v) => v.artifacts.some((a) => a.available));
  return targetVersion?.artifacts.find((a) => a.platform === platform && a.available);
};

const getLatestVersion = (product: ProductManifestDto): string =>
  product.versions.find((v) => v.artifacts.some((a) => a.available))?.version ?? "";

const formatSizeMB = (size: number | null | undefined): string =>
  size ? `${(size / (1024 * 1024)).toFixed(1)} MB` : "";

/**
 * Builds the artifact metadata line for a download row, e.g.
 * "v0.1.83 · 184 MB · 64-bit". Omits any segment that is unknown.
 */
const buildArtifactMetadata = (artifact: ArtifactDto | undefined, version: string): string => {
  const arch = artifact?.architecture === "x86_64" ? "64-bit" : artifact?.architecture;
  const items = [
    version ? `v${version}` : "",
    artifact?.size ? formatSizeMB(artifact.size) : "",
    arch || "",
  ].filter(Boolean);
  return items.join(" · ");
};

const OneLinerBlock = ({ command, label = "PowerShell" }: { command: string; label?: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      ?.writeText(command)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1000);
      })
      .catch(() => {
        // Swallow clipboard errors
      });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-sunken">
      <div className="flex items-center justify-between border-b border-line pl-3 pr-2 py-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Terminal className="h-3.5 w-3.5" />
          <span className="text-xs">{label}</span>
        </div>
        <CopyButton isCopied={isCopied} onClick={handleCopy} className="hover:bg-hover" />
      </div>

      <div className="px-4 py-3">
        <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-code text-ink">
          <code>{command}</code>
        </pre>
      </div>
    </div>
  );
};

interface DownloadRowProps {
  artifact: ArtifactDto | undefined;
  title: string;
  description: string;
  metadata?: string;
  icon: React.ReactNode;
  iconClass: string;
  hoverClass: string;
  disabled?: boolean;
}

const DownloadRow = ({
  artifact,
  title,
  description,
  metadata,
  icon,
  iconClass,
  hoverClass,
  disabled,
}: DownloadRowProps) => {
  const hasDownload = !disabled && !!artifact?.url;

  const handleClick = () => {
    if (hasDownload) window.open(artifact!.url, "_blank");
  };

  return (
    <div
      className={cn(
        "group flex w-full items-center justify-between gap-6 rounded-lg border border-line bg-surface px-6 py-5 text-left transition-colors",
        hasDownload && hoverClass,
      )}
    >
      <div className="flex min-w-0 flex-1 gap-4">
        <div
          className={cn(
            "flex h-10 w-10 mt-0.5 min-h-10 min-w-10 items-center justify-center rounded-lg",
            iconClass,
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex flex-col gap-1">
          <p className="font-bold text-foreground">{title}</p>
          <p className="text-sm leading-4 text-muted-foreground">{description}</p>
          {metadata ? (
            <p className="font-mono text-2xs tabular-nums text-muted-foreground">{metadata}</p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center pl-2">
        {hasDownload ? (
          <Button type="button" size="sm" className="w-24" onClick={handleClick}>
            Download
          </Button>
        ) : (
          <Button type="button" size="sm" className="w-24" disabled>
            Download
          </Button>
        )}
      </div>
    </div>
  );
};

const FAQItem = ({
  value,
  question,
  answer,
}: {
  value: string;
  question: string;
  answer: React.ReactNode;
}) => (
  <AccordionItem value={value}>
    <AccordionTrigger className="text-sm font-semibold text-ink">{question}</AccordionTrigger>
    <AccordionContent className="text-sm text-muted-foreground">{answer}</AccordionContent>
  </AccordionItem>
);

interface RunnerInstallRowProps {
  artifact: ArtifactDto | undefined;
  title: string;
  description: string;
  metadata?: string;
  icon: React.ReactNode;
  iconClass: string;
  hoverClass: string;
  powershellOneLiner: string;
}

/**
 * Renders the Runner App row with an outline, monospace "Install" button that
 * expands the row into a numbered, step-by-step install guide. The runner is not
 * downloaded directly — it is provisioned as a Windows service via a script.
 */
const RunnerInstallRow = ({
  artifact,
  title,
  description,
  metadata,
  icon,
  iconClass,
  hoverClass,
  powershellOneLiner,
}: RunnerInstallRowProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasInstall = !!artifact?.url;

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div
        className={cn(
          "group flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors",
          hasInstall && hoverClass,
        )}
      >
        <div className="flex min-w-0 flex-1 gap-4">
          <div
            className={cn(
              "flex h-10 w-10 mt-0.5 min-h-10 min-w-10 items-center justify-center rounded-lg",
              iconClass,
            )}
          >
            {icon}
          </div>
          <div className="min-w-0 flex flex-col gap-1">
            <p className="font-bold text-foreground">{title}</p>
            <p className="text-sm leading-4 text-muted-foreground">{description}</p>
            {metadata ? (
              <p className="font-mono text-2xs tabular-nums text-muted-foreground">{metadata}</p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center pl-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-24 font-mono"
            disabled={!hasInstall}
            onClick={() => setIsOpen(true)}
          >
            Install
          </Button>
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-line bg-surface px-6 py-5">
          <ol className="space-y-5">
            <li>
              <p className="mb-2 text-sm font-semibold text-ink-2">
                Step 1: Open PowerShell as Administrator
              </p>
              <p className="mb-2 text-sm text-muted-foreground">
                Press <span className="font-semibold text-ink-2">Windows key</span>, type{" "}
                <span className="font-semibold text-ink-2">PowerShell</span>, right-click{" "}
                <span className="font-semibold text-ink-2">Windows PowerShell</span>, and choose{" "}
                <span className="font-semibold text-ink-2">Run as administrator</span>. This works
                on Windows 10, 11, and Server.
              </p>
            </li>
            <li>
              <p className="mb-2 text-sm font-semibold text-ink-2">
                Step 2: Allow local scripts to run
              </p>
              <p className="mb-2 text-sm text-muted-foreground">
                PowerShell blocks unsigned scripts by default. Run the command below once in the
                same Administrator session so the downloaded provisioning script can execute.
              </p>
              <OneLinerBlock command="Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" />
            </li>
            <li>
              <p className="mb-2 text-sm font-semibold text-ink-2">
                Step 3: Run the provisioning one-liner
              </p>
              <p className="mb-2 text-sm text-muted-foreground">
                Paste and run the block below. It sets your environment variables, downloads the
                provisioning script, and runs it. The script downloads the runner, registers it as a
                Windows service, and starts it. No additional runtime is required. Replace{" "}
                <code className="rounded-sm bg-sunken px-1 py-0.5 font-mono text-code">
                  &lt;API_KEY&gt;
                </code>{" "}
                with your tenant API key (see FAQ).
              </p>
              <OneLinerBlock command={powershellOneLiner} />
            </li>
            <li>
              <p className="mb-2 text-sm font-semibold text-ink-2">
                Step 4: Verify the service was created
              </p>
              <OneLinerBlock command="sc.exe qc AvintraRunnerService" />
            </li>
            <li>
              <p className="mb-2 text-sm font-semibold text-ink-2">Step 5: Check service status</p>
              <OneLinerBlock command="sc.exe query AvintraRunnerService" />
            </li>
          </ol>

          {/* Separator: install steps above, maintenance commands below */}
          <div className="mt-8 mb-6 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-label uppercase text-muted-foreground">
              Other useful commands
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <ul className="space-y-5">
            <li>
              <p className="mb-2 text-sm font-semibold text-ink-2">Restart the service</p>
              <OneLinerBlock
                command={`net stop AvintraRunnerService\nnet start AvintraRunnerService`}
              />
            </li>
            <li>
              <p className="mb-2 text-sm font-semibold text-ink-2">Stop the service</p>
              <OneLinerBlock command="net stop AvintraRunnerService" />
            </li>
            <li>
              <p className="mb-2 text-sm font-semibold text-ink-2">Uninstall the service</p>
              <p className="mb-2 text-sm text-muted-foreground">
                If you ever need to remove the runner from your machine, run the below commands from
                an Administrator PowerShell:
              </p>
              <OneLinerBlock
                command={`cd "C:\\Program Files\\AvintraRunnerService"\n.\\AvintraRunnerService.exe --uninstall\ncd ..\nRemove-Item -Recurse -Force "C:\\Program Files\\AvintraRunnerService"`}
              />
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
};

const ComingSoonPanel: React.FC<{ platform: Platform }> = ({ platform }) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-sunken px-6 py-14 text-center">
    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-md border border-line bg-surface text-ink-2">
      <PlatformIcon platform={platform} className="h-7 w-7" />
    </div>
    <h3 className="mb-2 text-heading text-ink">
      {PLATFORM_LABELS[platform]} support is on the way
    </h3>
    <p className="max-w-sm text-sm text-muted-foreground">
      We are actively working on {PLATFORM_LABELS[platform]} support. Please check back soon for
      updates.
    </p>
  </div>
);

const PlatformIcon: React.FC<{ platform: Platform; className?: string }> = ({
  platform,
  className,
}) => {
  if (platform === "macos") return <FaApple className={className} />;
  if (platform === "linux") return <SiLinux className={className} />;
  return <FaWindows className={className} />;
};

const useSessionForRunnerInstall = () => {
  const { tenantId, email } = useUserSessionStore(
    useShallow((state) => ({
      tenantId: state.userSession?.tenantId,
      email: state.userSession?.email,
    })),
  );
  return { tenantId, linkedUsername: email };
};

const DownloadContent: React.FC<{
  data: NonNullable<ReturnType<typeof useDesktopDownloadManifest>["data"]>;
}> = ({ data }) => {
  const desktop = useMemo(() => data.desktop ?? { versions: [] }, [data.desktop]);
  const runner = useMemo(() => data.runner ?? { versions: [] }, [data.runner]);
  const { tenantId, linkedUsername } = useSessionForRunnerInstall();

  // OS tab — default to the user's detected platform
  const [activePlatform, setActivePlatform] = useState<Platform>(() => detectPlatform());

  // The runner/installer expect the backend host origin only. The runner
  // internally calls /accounts/api/... and /workspace/api/... paths, and the
  // install script resolves the runner zip from /files/binaries/runner/latest.
  const apiBaseUrl = useMemo(() => window.location.origin.replace(/\/$/, ""), []);

  // Derive the static-files proxy origin separately; the install script is
  // served from /files/scripts/Install-AvintraRunnerService.ps1.
  const filesBaseUrl = useMemo(() => {
    const path = import.meta.env.VITE_FILES_API_PATH ?? "/files";
    const origin = window.location.origin.replace(/\/$/, "");
    return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
  }, []);

  const powershellOneLiner = useMemo(
    () =>
      buildOllamaStylePowerShellCommand(
        apiBaseUrl,
        `${filesBaseUrl}/scripts/Install-AvintraRunnerService.ps1`,
        tenantId,
        linkedUsername,
      ),
    [apiBaseUrl, filesBaseUrl, tenantId, linkedUsername],
  );

  const isWindows = activePlatform === "windows";

  // Resolve the latest available artifact + version for each product once, so the
  // rows don't re-scan the version list on every render.
  const desktopAppArtifact = useMemo(() => getArtifactForPlatform(desktop, "windows"), [desktop]);
  const desktopAppVersion = useMemo(() => getLatestVersion(desktop), [desktop]);
  const runnerAppArtifact = useMemo(() => getArtifactForPlatform(runner, "windows"), [runner]);
  const runnerAppVersion = useMemo(() => getLatestVersion(runner), [runner]);

  return (
    <div className="flex items-center justify-center bg-surface p-8 text-ink">
      <main className="w-full max-w-2xl text-left">
        {/* OS tabs */}
        <div className="mb-5 flex items-center justify-start gap-4">
          <Tabs
            value={activePlatform}
            onValueChange={(v) => setActivePlatform(v as Platform)}
            className="shrink-0"
          >
            <TabsList>
              <TabsTrigger value="windows">
                <PlatformIcon platform="windows" className="h-3.5 w-3.5" />
                Windows
              </TabsTrigger>
              <TabsTrigger value="macos">
                <FaApple className="h-3.5 w-3.5" />
                macOS
              </TabsTrigger>
              <TabsTrigger value="linux">
                <PlatformIcon platform="linux" className="h-3.5 w-3.5" />
                Linux
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Title + subheading — full width, left aligned */}
        <div className="mb-8">
          <DialogTitle className="text-title text-ink">
            Bring the builder to your desktop
          </DialogTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            {isWindows
              ? "Download the app and runner for Windows."
              : `Download the app for ${PLATFORM_LABELS[activePlatform]}.`}
          </p>
        </div>

        {isWindows ? (
          <>
            <div className="space-y-4">
              <DownloadRow
                artifact={desktopAppArtifact}
                title="Desktop app"
                description="The builder app for creating, editing, and testing agents on your local machine."
                metadata={buildArtifactMetadata(desktopAppArtifact, desktopAppVersion)}
                icon={<Monitor className="h-5 w-5" />}
                iconClass="bg-sunken text-ink-2"
                hoverClass="hover:border-line-strong hover:bg-hover"
              />
              <RunnerInstallRow
                artifact={runnerAppArtifact}
                title="Runner app"
                description="Headless Windows service that runs published agents in the background on your machine."
                metadata={buildArtifactMetadata(runnerAppArtifact, runnerAppVersion)}
                icon={<Terminal className="h-5 w-5" />}
                iconClass="bg-sunken text-ink-2"
                hoverClass="hover:bg-hover"
                powershellOneLiner={powershellOneLiner}
              />
            </div>
            {/* TODO: Unhide the release notes once repo is hosted in github and release notes are there */}
            <p className="hidden mt-6 text-sm text-muted-foreground">
              Release notes &middot;{" "}
              <a
                href={RELEASE_NOTES_URL}
                target="_blank"
                rel="noreferrer"
                className="text-primary-text hover:underline"
              >
                View on GitHub
              </a>
            </p>

            <h2 className="mt-8 text-heading text-ink">FAQs</h2>

            <Accordion
              type="single"
              collapsible
              className="mt-3 divide-y divide-line border-b border-t border-line"
            >
              <FAQItem
                value="what-is-runner"
                question="What is the Runner App and how is it different from the Desktop App?"
                answer="The Desktop App is the interactive builder you use to create, edit, and test agents. The Runner App is a lightweight Windows service that runs published agents in the background on your machine, so they keep executing even when the builder is closed."
              />
              <FAQItem
                value="api-key"
                question="Where do I find API key?"
                answer={
                  <>
                    User with Orchestrator manager access can create an API key with Machine
                    Authentication permission. You'll need it when running the install command -
                    replace the{" "}
                    <code className="rounded-sm bg-sunken px-1 py-0.5 font-mono text-code">
                      &lt;API_KEY&gt;
                    </code>{" "}
                    placeholder with it.
                  </>
                }
              />
              <FAQItem
                value="update"
                question="How do I update the Runner App?"
                answer="Re-run the install command from the guide. The script stops the service, replaces the files with the latest version, and restarts the service automatically."
              />
              <FAQItem
                value="uninstall"
                question="How do I uninstall the Runner App?"
                answer={
                  <>
                    Run{" "}
                    <code className="rounded-sm bg-sunken px-1 py-0.5 font-mono text-code">
                      AvintraRunnerService.exe --uninstall
                    </code>{" "}
                    from an Administrator PowerShell in the install directory (default:{" "}
                    <code className="rounded-sm bg-sunken px-1 py-0.5 font-mono text-code">
                      C:\Program Files\AvintraRunnerService
                    </code>
                    ). The exe stops the Windows service and removes its registration in one step.
                  </>
                }
              />
              <FAQItem
                value="platforms"
                question="When will macOS and Linux be supported?"
                answer="We are actively testing macOS and Linux builds. Please check back soon for updates."
              />
            </Accordion>
          </>
        ) : (
          <ComingSoonPanel platform={activePlatform} />
        )}
      </main>
    </div>
  );
};

const DownloadDialogContent: React.FC = () => {
  const { data, isLoading, error } = useDesktopDownloadManifest();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-destructive">Failed to load download manifest.</span>
      </div>
    );
  }

  return <DownloadContent data={data} />;
};

export { DownloadDialogContent };
