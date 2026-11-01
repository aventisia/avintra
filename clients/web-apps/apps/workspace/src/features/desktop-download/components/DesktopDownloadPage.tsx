import { Skeleton } from "@avplatform/ui";
import { Button, buttonVariants } from "@avplatform/ui/buttons";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { DownloadIcon, MonitorIcon, ServerCogIcon } from "lucide-react";
import { useState } from "react";

import { PLATFORM_LABELS, RUNNER_INSTALL_SECTION_ID } from "../constants/desktop-download.constant";
import { useDesktopDownloadManifest } from "../hooks/useDesktopDownloads.hook";
import { type Platform, detectPlatform } from "../utils/detect-platform.util";
import { describeArtifact, getLatestArtifact } from "../utils/download-manifest.util";
import { DownloadFaq } from "./DownloadFaq";
import { PlatformIcon } from "./PlatformIcon";
import { PlatformSwitch } from "./PlatformSwitch";
import { ProductCard } from "./ProductCard";
import { RunnerInstallGuide } from "./RunnerInstallGuide";
import { RunnerServiceCommands } from "./RunnerServiceCommands";

const DETECTED_PLATFORM = detectPlatform();

const scrollToRunnerInstall = () =>
  document
    .getElementById(RUNNER_INSTALL_SECTION_ID)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

const ComingSoonNotice = ({ platform }: { platform: Platform }) => (
  <div className="mt-8 flex items-center gap-3 rounded-lg border border-line bg-sunken px-4 py-3">
    <PlatformIcon platform={platform} className="size-4 shrink-0 text-ink-2" />
    <p className="text-body-sm text-ink-2">
      {PLATFORM_LABELS[platform]} builds are on the way. Both apps run on Windows today.
    </p>
  </div>
);

const ProductCards = ({ platform }: { platform: Platform }) => {
  const { data, isLoading, isError, refetch, isRefetching } = useDesktopDownloadManifest();

  if (isLoading) {
    return (
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[19rem] rounded-xl" />
        <Skeleton className="h-[19rem] rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-5 py-4">
        <p className="text-body-sm text-ink-2">Couldn't load the download links.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          Try again
        </Button>
      </div>
    );
  }

  const isWindows = platform === "windows";
  const desktopApp = getLatestArtifact(data.desktop, "windows");
  const runnerApp = getLatestArtifact(data.runner, "windows");
  const unavailableLabel = isWindows ? "Not available yet" : "Windows only";

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <ProductCard
        icon={<MonitorIcon />}
        audience="For builders"
        name="Desktop app"
        pitch="The builder on your own machine, signed in to this workspace."
        highlights={[
          "Create, edit and test agents locally",
          "Runs agents on this machine while you build them",
          "Same agents and folders as the web app",
        ]}
        details={desktopApp && describeArtifact(desktopApp)}
        action={
          desktopApp && isWindows ? (
            <a
              href={desktopApp.artifact.url}
              rel="noreferrer"
              className={cn(buttonVariants(), "gap-1.5")}
            >
              <DownloadIcon className="size-4" />
              Download for Windows
            </a>
          ) : (
            <Button disabled>{unavailableLabel}</Button>
          )
        }
      />
      <ProductCard
        icon={<ServerCogIcon />}
        audience="For unattended runs"
        name="Runner app"
        pitch="A Windows service with no window that runs published agents in the background."
        highlights={[
          "Keeps running when nobody is signed in to the builder",
          "Installs with one PowerShell command",
          "Updates by running the same command again",
        ]}
        details={runnerApp && describeArtifact(runnerApp)}
        action={
          <Button
            variant="outline"
            disabled={!runnerApp || !isWindows}
            onClick={scrollToRunnerInstall}
          >
            {runnerApp && isWindows ? "See install steps" : unavailableLabel}
          </Button>
        }
      />
    </div>
  );
};

/** Download page for the Desktop builder app and the Runner service. */
export const DesktopDownloadPage = () => {
  useDocumentTitle("Desktop apps");
  const [platform, setPlatform] = useState<Platform>(DETECTED_PLATFORM);

  return (
    <div className="mx-auto max-w-5xl space-y-14 pb-16 pt-6">
      <div>
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-title text-ink">Desktop apps</h1>
            <p className="mt-[5px] text-[13px] text-muted-foreground">
              Build agents on your own machine, and run published agents in the background.
            </p>
          </div>
          <PlatformSwitch value={platform} detected={DETECTED_PLATFORM} onChange={setPlatform} />
        </header>
        {platform !== "windows" && <ComingSoonNotice platform={platform} />}
        <ProductCards platform={platform} />
      </div>
      {platform === "windows" && (
        <>
          <RunnerInstallGuide />
          <RunnerServiceCommands />
        </>
      )}
      <DownloadFaq />
    </div>
  );
};
