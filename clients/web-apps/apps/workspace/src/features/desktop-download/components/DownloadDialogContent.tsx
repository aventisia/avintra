import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@avplatform/ui/accordion";
import { Button, CopyButton } from "@avplatform/ui/buttons";
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

const buildExecutorServiceCommand = (
  baseUrl: string,
  tenantId: string | undefined,
  linkedUsername: string | undefined,
) => {
  const appBaseUrl = baseUrl.replace(/\/$/, "");
  const t = tenantId ?? "<TENANT_ID>";
  const u = linkedUsername ?? "<LINKED_USERNAME>";
  return `AvintraRunnerService.exe --install --appBaseUrl "${appBaseUrl}" --apiKey "<API_KEY>" --tenantId "${t}" --linkedUsername "${u}"`;
};

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
    `irm "${scriptUrl}" | iex`,
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
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-sm">
      <div className="flex items-center justify-between bg-slate-900 pl-3 pr-2 py-1">
        <div className="flex items-center gap-2 text-slate-500">
          <Terminal className="h-3.5 w-3.5" />
          <span className="text-xs">{label}</span>
        </div>
        <CopyButton
          isCopied={isCopied}
          onClick={handleCopy}
          className="border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 hover:text-white"
        />
      </div>

      <div className="px-4 py-3">
        <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-sm text-slate-100">
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
        "group flex w-full items-center justify-between gap-6 rounded-xl border border-slate-200 bg-slate-50 px-6 py-5 text-left transition-colors",
        hasDownload ? hoverClass : "border-slate-200 bg-slate-50",
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
          {metadata ? <p className="text-2xs text-muted-foreground">{metadata}</p> : null}
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
    <AccordionTrigger className="text-sm font-semibold text-slate-800">{question}</AccordionTrigger>
    <AccordionContent className="text-sm text-slate-500">{answer}</AccordionContent>
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
  installCommand: string;
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
  installCommand,
}: RunnerInstallRowProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasInstall = !!artifact?.url;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <div
        className={cn(
          "group flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors",
          hasInstall ? hoverClass : "border-slate-200 bg-slate-50",
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
            {metadata ? <p className="text-2xs text-muted-foreground">{metadata}</p> : null}
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
        <div className="border-t border-slate-200 bg-white px-6 py-5">
          <ol className="space-y-5">
            <li>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Step 1: Open PowerShell as Administrator
              </p>
              <p className="mb-2 text-sm text-slate-500">
                Press <span className="font-semibold text-slate-600">Windows key</span>, type{" "}
                <span className="font-semibold text-slate-600">PowerShell</span>, right-click{" "}
                <span className="font-semibold text-slate-600">Windows PowerShell</span>, and choose{" "}
                <span className="font-semibold text-slate-600">Run as administrator</span>. This
                works on Windows 10, 11, and Server.
              </p>
            </li>
            <li>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Step 2: Run the provisioning one-liner
              </p>
              <p className="mb-2 text-sm text-slate-500">
                Paste and run the block below. It sets your environment variables, downloads the
                provisioning script, and runs it. The script downloads the runner, registers it as a
                Windows service, and starts it. No additional runtime is required.
              </p>
              <OneLinerBlock command={powershellOneLiner} />
              <p className="mb-3 mt-1 text-sm text-slate-500">
                Replace{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">&lt;API_KEY&gt;</code>{" "}
                with your tenant API key (see FAQ).
              </p>
            </li>
            <li>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Step 3: Verify the service was created
              </p>
              <OneLinerBlock command='sc qc "AvintraRunnerService"' />
            </li>
            <li>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Step 4: Check service status
              </p>
              <OneLinerBlock command='sc query "AvintraRunnerService"' />
            </li>
            <li>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Step 5: Restart the service
              </p>
              <OneLinerBlock
                command={`sc stop "AvintraRunnerService"\nsc start "AvintraRunnerService"`}
              />
            </li>
            <li>
              <p className="mb-2 text-sm font-semibold text-slate-700">Step 6: Stop the service</p>
              <OneLinerBlock command='sc stop "AvintraRunnerService"' />
            </li>
            <li>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Step 7: Or install manually from the runner zip
              </p>
              <p className="mb-2 text-sm text-slate-500">
                Download the runner zip and extract it to{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                  C:\Program Files\AvintraRunnerService
                </code>
                , then run the command below from an Administrator PowerShell in that directory. The
                script and the exe both call the same registration path, so use one or the other —
                don't combine them.
              </p>
              <OneLinerBlock command={installCommand} />
            </li>
            <li>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Step 8: Uninstall the service
              </p>
              <p className="mb-2 text-sm text-slate-500">
                If you ever need to remove the runner from this machine, run this from an
                Administrator PowerShell in{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                  C:\Program Files\AvintraRunnerService
                </code>
                . The exe handles both stopping the service and removing its registration:
              </p>
              <OneLinerBlock command="AvintraRunnerService.exe --uninstall" />
            </li>
          </ol>
        </div>
      ) : null}
    </div>
  );
};

const ComingSoonPanel: React.FC<{ platform: Platform }> = ({ platform }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      <PlatformIcon platform={platform} className="h-7 w-7" />
    </div>
    <h3 className="mb-2 text-lg font-bold text-slate-800">
      {PLATFORM_LABELS[platform]} support is on the way
    </h3>
    <p className="max-w-sm text-sm text-slate-500">
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

  // Derive the accounts API origin from VITE_ACCOUNTS_API_PATH so the one-liner
  // works regardless of the workspace path the user is browsing from (e.g.
  // /workspace/) and uses the correct backend host (not a localhost dev hostname
  // the Windows machine can't resolve).
  const apiBaseUrl = useMemo(() => {
    const path = import.meta.env.VITE_FILES_API_PATH ?? "/files";
    const origin = window.location.origin.replace(/\/$/, "");
    return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
  }, []);
  const installCommand = useMemo(
    () => buildExecutorServiceCommand(apiBaseUrl, tenantId, linkedUsername),
    [apiBaseUrl, tenantId, linkedUsername],
  );
  const powershellOneLiner = useMemo(
    () =>
      buildOllamaStylePowerShellCommand(
        apiBaseUrl,
        `${apiBaseUrl}/binaries/runner/script/Install-AvintraRunnerService.ps1`,
        tenantId,
        linkedUsername,
      ),
    [apiBaseUrl, tenantId, linkedUsername],
  );

  const isWindows = activePlatform === "windows";

  // Resolve the latest available artifact + version for each product once, so the
  // rows don't re-scan the version list on every render.
  const desktopAppArtifact = useMemo(() => getArtifactForPlatform(desktop, "windows"), [desktop]);
  const desktopAppVersion = useMemo(() => getLatestVersion(desktop), [desktop]);
  const runnerAppArtifact = useMemo(() => getArtifactForPlatform(runner, "windows"), [runner]);
  const runnerAppVersion = useMemo(() => getLatestVersion(runner), [runner]);

  return (
    <div className="flex items-center justify-center bg-white p-8 text-slate-800">
      <main className="w-full max-w-2xl text-left">
        {/* OS tabs */}
        <div className="mb-5 flex items-center justify-start gap-4">
          <Tabs
            value={activePlatform}
            onValueChange={(v) => setActivePlatform(v as Platform)}
            className="shrink-0"
          >
            <TabsList className="h-9 bg-slate-100 p-1">
              <TabsTrigger
                value="windows"
                className="flex h-7 items-center font-semibold gap-1.5 px-2.5 text-2xs data-[state=active]:bg-white"
              >
                <PlatformIcon platform="windows" className="h-3.5 w-3.5" />
                Windows
              </TabsTrigger>
              <TabsTrigger
                value="macos"
                className="flex h-7 items-center font-semibold gap-1.5 px-2.5 text-2xs data-[state=active]:bg-white"
              >
                <FaApple className="h-3.5 w-3.5" />
                macOS
              </TabsTrigger>
              <TabsTrigger
                value="linux"
                className="flex h-7 items-center font-semibold gap-1.5 px-2.5 text-2xs data-[state=active]:bg-white"
              >
                <PlatformIcon platform="linux" className="h-3.5 w-3.5" />
                Linux
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Title + subheading — full width, left aligned */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Bring the builder to your desktop
          </h1>
          <p className="mt-2 text-sm text-slate-500">
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
                title="Desktop App"
                description="The builder app for creating, editing, and testing flows on your local machine."
                metadata={buildArtifactMetadata(desktopAppArtifact, desktopAppVersion)}
                icon={<Monitor className="h-5 w-5" />}
                iconClass="bg-primary-50 text-primary-500"
                hoverClass="hover:border-primary/40 hover:bg-primary/5"
              />
              <RunnerInstallRow
                artifact={runnerAppArtifact}
                title="Runner App"
                description="Headless Windows service that runs published flows in the background on this machine."
                metadata={buildArtifactMetadata(runnerAppArtifact, runnerAppVersion)}
                icon={<Terminal className="h-5 w-5" />}
                iconClass="bg-slate-100 text-slate-600"
                hoverClass="hover:border-slate-300 hover:bg-slate-100"
                powershellOneLiner={powershellOneLiner}
                installCommand={installCommand}
              />
            </div>

            <p className="mt-6 text-sm text-slate-400">
              Release notes &middot;{" "}
              <a
                href={RELEASE_NOTES_URL}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                View on GitHub
              </a>
            </p>

            <h2 className="mt-8 text-sm font-bold text-slate-700">FAQs</h2>

            <Accordion
              type="single"
              collapsible
              className="mt-3 divide-y divide-slate-200 border-b border-t border-slate-200"
            >
              <FAQItem
                value="what-is-runner"
                question="What is the Runner App and how is it different from the Desktop App?"
                answer="The Desktop App is the interactive builder you use to create, edit, and test flows. The Runner App is a lightweight Windows service that runs published flows in the background on this machine, so they keep executing even when the builder is closed."
              />
              <FAQItem
                value="api-key"
                question="Where do I find API key?"
                answer={
                  <>
                    User with Orchestrator manager access can create an API key with Machine
                    Authentication permission. You'll need it when running the install command —
                    replace the{" "}
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
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
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                      AvintraRunnerService.exe --uninstall
                    </code>{" "}
                    from an Administrator PowerShell in the install directory (default:{" "}
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
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
