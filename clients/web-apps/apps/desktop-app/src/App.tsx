import { useThemeStore } from "@avplatform/ui/stores";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

import ServiceUrlPage from "./ServiceUrlPage";
import { TauriAppFooter } from "./TauriAppFooter";
import { GetRunnerApp } from "./components/GetRunnerApp";
import { UpdateDesktopApp } from "./components/UpdateDesktopApp";
import { UpdateRunnerApp } from "./components/UpdateRunnerApp";
import { type RunnerCheckResult } from "./hooks/useRunnerProvisioning";
import {
  clearSetupState,
  getSavedServiceUrl,
  getSavedSetupStep,
  setSavedServiceUrl,
  setSetupStep,
} from "./lib/setupStore";

type RunnerStep = "install" | "update";

/** Union of all top-level setup states. */
type Step = "service-url" | "desktop-update" | { type: "runner"; kind: RunnerStep };

const LS_BASE_URL_KEY = "aventisia:baseUrl";

function App() {
  return <SetupFlow />;
}

function AppHeader() {
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <header className="absolute left-1 right-0 top-3 flex items-center justify-between px-8 py-6">
      <img src={isDark ? "/logo_light.svg" : "/logo.svg"} alt="Aventisia" className="h-7" />
    </header>
  );
}

function SetupFlow() {
  const [step, setStep] = useState<Step>("service-url");
  const [appBaseUrl, setAppBaseUrl] = useState("");
  const [checkResult, setCheckResult] = useState<RunnerCheckResult | null>(null);
  const [isResuming, setIsResuming] = useState(true);

  /**
   * On startup, check if the app is resuming after a desktop update restart.
   * If a saved service URL and step exist, restore them so the user does not
   * have to re-enter the URL or re-check the desktop app.
   */
  useEffect(() => {
    let cancelled = false;

    async function resume() {
      const savedStep = await getSavedSetupStep();
      const savedUrl = await getSavedServiceUrl();

      if (cancelled) return;

      if (savedStep === "runner" && savedUrl) {
        // Resume directly at runner check after a desktop update restart.
        setAppBaseUrl(savedUrl);
        setStep({ type: "runner", kind: "install" });
        void runRunnerCheck(savedUrl);
      } else if (savedStep === "desktop-update" && savedUrl) {
        // Resume at the desktop update step.
        setAppBaseUrl(savedUrl);
        setStep("desktop-update");
      } else {
        // Fresh start: prefer localStorage for the URL if it exists.
        const localUrl = localStorage.getItem(LS_BASE_URL_KEY);
        if (localUrl) {
          setAppBaseUrl(localUrl);
        }
      }

      setIsResuming(false);
    }

    void resume();
    return () => {
      cancelled = true;
    };
    // runRunnerCheck is defined inside the component but has no dependencies that
    // change between renders, so it is safe to omit from the dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRunnerAppComplete = () => {
    void clearSetupState();
    window.location.href = `${appBaseUrl}/accounts/login`;
  };

  const runRunnerCheck = async (baseUrl: string) => {
    try {
      const result = await invoke<RunnerCheckResult>("check_runner_app", {
        appBaseUrl: baseUrl,
      });
      setCheckResult(result);

      if (result.installed && !result.update_available) {
        handleRunnerAppComplete();
        return;
      }

      setStep({
        type: "runner",
        kind: result.installed && result.update_available ? "update" : "install",
      });
      await setSetupStep("runner");
      return;
    } catch {
      // Let the runner page surface the error so the user can retry.
    }

    setStep({ type: "runner", kind: "install" });
    await setSetupStep("runner");
  };

  const handleServiceUrlContinue = async (baseUrl: string) => {
    setAppBaseUrl(baseUrl);
    await setSavedServiceUrl(baseUrl);
    await setSetupStep("desktop-update");

    setStep("desktop-update");
  };

  const handleDesktopUpdateSkip = async () => {
    await setSetupStep("runner");
    await runRunnerCheck(appBaseUrl);
  };

  const handleDesktopUpdateInstall = async () => {
    // The Rust install_update command restarts the app. We keep the saved
    // service URL and mark that we should resume at the runner check.
    await setSetupStep("runner");
  };

  if (isResuming) {
    return (
      <div className="relative flex min-h-screen flex-col bg-bg text-ink">
        <AppHeader />
        <div className="flex flex-1 items-center justify-center p-6">
          <span className="text-body text-muted-foreground">Resuming setup...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-bg pb-8 text-ink">
      <AppHeader />

      {step === "service-url" ? (
        <ServiceUrlPage onContinue={handleServiceUrlContinue} />
      ) : step === "desktop-update" ? (
        <UpdateDesktopApp
          domain={appBaseUrl}
          onSkip={handleDesktopUpdateSkip}
          onInstall={handleDesktopUpdateInstall}
        />
      ) : step.type === "runner" ? (
        step.kind === "install" ? (
          <GetRunnerApp
            appBaseUrl={appBaseUrl}
            latestVersion={checkResult?.latest_version ?? "..."}
            onSkip={handleRunnerAppComplete}
            onComplete={handleRunnerAppComplete}
          />
        ) : checkResult ? (
          <UpdateRunnerApp
            appBaseUrl={appBaseUrl}
            currentVersion={checkResult.installed_version}
            latestVersion={checkResult.latest_version}
            onSkip={handleRunnerAppComplete}
            onComplete={handleRunnerAppComplete}
          />
        ) : null
      ) : null}

      <footer>
        <TauriAppFooter />
      </footer>
    </div>
  );
}

export default App;
