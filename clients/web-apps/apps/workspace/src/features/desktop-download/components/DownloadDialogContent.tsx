import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@avplatform/ui/accordion";
import { Button, CopyButton } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { Monitor, ServerCog, Terminal } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { FaApple, FaWindows } from "react-icons/fa";
import { SiLinux } from "react-icons/si";

import type { ArtifactDto, ProductManifestDto } from "../dtos/download-manifest.dto";
import { useDesktopDownloadManifest } from "../hooks/useDesktopDownloads.hook";
import { type Platform, detectPlatform } from "../utils/detect-platform.util";

const RELEASE_NOTES_URL = "https://github.com/aventisia/avintra-platform/releases";

const EXECUTOR_SERVICE_COMMAND = "AvintraDesktopRunner.exe --install";

const PLATFORM_LABELS: Record<Platform, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
};

const getAvailableVersions = (product: ProductManifestDto): string[] =>
  product.versions
    .filter((v) => v.artifacts.some((a) => a.available))
    .map((v) => v.version)
    .filter(Boolean);

const getCommonAvailableVersions = (
  desktopApp: ProductManifestDto,
  desktopRunner: ProductManifestDto,
): string[] => {
  const appVersions = new Set(getAvailableVersions(desktopApp));
  const runnerVersions = getAvailableVersions(desktopRunner).filter((v) => appVersions.has(v));
  return runnerVersions;
};

const getVersionForProduct = (product: ProductManifestDto, version: string) =>
  product.versions.find((v) => v.version === version);

const getArtifactForPlatform = (
  product: ProductManifestDto,
  platform: Platform,
  version?: string,
): ArtifactDto | undefined => {
  const targetVersion = version
    ? getVersionForProduct(product, version)
    : product.versions.find((v) => v.artifacts.some((a) => a.available));
  return targetVersion?.artifacts.find((a) => a.platform === platform && a.available);
};

const formatSizeMB = (size: number | null | undefined): string =>
  size ? `${(size / (1024 * 1024)).toFixed(1)} MB` : "";

/**
 * Builds the artifact metadata line for a download row, e.g.
 * "184 MB · 64-bit · Windows 10+". Omits any segment that is unknown.
 */
const buildArtifactMetadata = (artifact: ArtifactDto | undefined): string => {
  const arch = artifact?.architecture === "x86_64" ? "64-bit" : artifact?.architecture;
  const items = [
    artifact?.size ? formatSizeMB(artifact.size) : "",
    arch || "",
    "Windows 11",
  ].filter(Boolean);
  return items.join(" · ");
};

const TerminalBlock = () => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      ?.writeText(EXECUTOR_SERVICE_COMMAND)
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
      {/* Terminal header */}
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2">
        <div className="flex items-center gap-2 text-slate-500">
          <Terminal className="h-3.5 w-3.5" />
          <span className="text-xs">Terminal</span>
        </div>
        <span className="text-xs text-slate-500">PowerShell / CMD</span>
      </div>

      {/* Terminal body with copy button */}
      <div className="group relative px-4 py-3">
        <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <CopyButton
            showTooltip={false}
            isCopied={isCopied}
            onClick={handleCopy}
            className="border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
          />
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-sm text-slate-100">
          <code>{EXECUTOR_SERVICE_COMMAND}</code>
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
          <Button type="button" size="sm" onClick={handleClick}>
            Download
          </Button>
        ) : (
          <Button type="button" size="sm" disabled>
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
  answer: string;
}) => (
  <AccordionItem value={value}>
    <AccordionTrigger className="text-sm font-semibold text-slate-800">{question}</AccordionTrigger>
    <AccordionContent className="text-sm text-slate-500">{answer}</AccordionContent>
  </AccordionItem>
);

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

const DownloadContent: React.FC<{
  data: NonNullable<ReturnType<typeof useDesktopDownloadManifest>["data"]>;
}> = ({ data }) => {
  const { desktopApp, desktopExecutor } = data;

  // OS tab — default to the user's detected platform
  const [activePlatform, setActivePlatform] = useState<Platform>(() => detectPlatform());

  // Only show versions where both the Desktop App and Desktop Runner are available.
  const availableVersions = useMemo(
    () => getCommonAvailableVersions(desktopApp, desktopExecutor),
    [desktopApp, desktopExecutor],
  );
  const [selectedVersion, setSelectedVersion] = useState<string>("");

  // Keep selected version in sync when the manifest refreshes
  useEffect(() => {
    if (availableVersions.length && !availableVersions.includes(selectedVersion)) {
      setSelectedVersion(availableVersions[0]);
    }
  }, [availableVersions, selectedVersion]);

  const isWindows = activePlatform === "windows";

  return (
    <div className="flex items-center justify-center bg-white p-8 text-slate-800">
      <main className="w-full max-w-xl text-left">
        {/* Header row: version selector on the left, OS tabs on the right */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <Select value={selectedVersion} onValueChange={setSelectedVersion}>
            <SelectTrigger
              size="xs"
              className="w-auto gap-1 rounded-full border border-slate-200 bg-slate-100 pl-3 pr-2 font-semibold"
            >
              <SelectValue placeholder="No versions" />
            </SelectTrigger>
            <SelectContent className="min-w-0 w-auto">
              {availableVersions.length === 0 ? (
                <SelectItem value="__none" size="xs" disabled>
                  No versions available
                </SelectItem>
              ) : (
                availableVersions.map((v) => (
                  <SelectItem key={v} value={v} size="xs" className="gap-1">
                    v{v}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {/* OS tabs */}
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
            Download the app and runner for your platform.
          </p>
        </div>

        {isWindows ? (
          <>
            <div className="space-y-4">
              <DownloadRow
                artifact={getArtifactForPlatform(desktopApp, "windows", selectedVersion)}
                title="Desktop App"
                description="Your primary command center for designing, refining, and orchestrating agents locally."
                metadata={buildArtifactMetadata(
                  getArtifactForPlatform(desktopApp, "windows", selectedVersion),
                )}
                icon={<Monitor className="h-5 w-5" />}
                iconClass="bg-primary-50 text-primary-500"
                hoverClass="hover:border-primary/40 hover:bg-primary/5"
              />

              <DownloadRow
                artifact={getArtifactForPlatform(desktopExecutor, "windows", selectedVersion)}
                title="Desktop Runner"
                description="A low-footprint local service handling asynchronous job execution and cloud state sync."
                metadata={buildArtifactMetadata(
                  getArtifactForPlatform(desktopExecutor, "windows", selectedVersion),
                )}
                icon={<ServerCog className="h-5 w-5" />}
                iconClass="bg-primary-50 text-primary-500"
                hoverClass="hover:border-primary/30 hover:bg-primary/5"
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

            {/* CLI install hint */}
            <div className="mt-6 text-left">
              <h3 className="mb-3 text-sm font-bold text-slate-700">
                Install Desktop Runner as a Windows service
              </h3>
              <p className="mb-3 text-sm text-slate-500">
                Run this from an Administrator terminal after downloading the Desktop Runner:
              </p>

              <TerminalBlock />
            </div>

            {/* FAQ */}
            <div className="mt-8 text-left">
              <h3 className="mb-4 text-sm font-bold text-slate-700">FAQ</h3>
              <Accordion
                type="single"
                collapsible
                className="divide-y divide-slate-200 border-b border-t border-slate-200"
              >
                <FAQItem
                  value="both"
                  question="Do I need both the Desktop App and the Runner?"
                  answer="No. Most users only need the Desktop App to build and test flows. Install the Runner if you want headless, background execution."
                />
                <FAQItem
                  value="headless"
                  question="Can I run flows without opening the builder?"
                  answer="Yes. The Desktop Runner can run published flows from the system tray or as a Windows service."
                />
                <FAQItem
                  value="platforms"
                  question="When will macOS and Linux be supported?"
                  answer="We are actively testing macOS and Linux builds. Join the waitlist to get notified when they are ready."
                />
              </Accordion>
            </div>
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

export { DownloadContent, DownloadDialogContent };
