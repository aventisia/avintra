import { ThemeSwitcher } from "@avplatform/layout/header";
import { useThemeStore } from "@avplatform/ui/stores";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

import ServiceUrlPage from "./ServiceUrlPage";
import SignInPage from "./SignInPage";
import { TauriAppFooter } from "./TauriAppFooter";
import WaitingPage from "./WaitingPage";
import { GetRunnerApp } from "./components/GetRunnerApp";
import { UpdateDesktopApp } from "./components/UpdateDesktopApp";
import { UpdateRunnerApp } from "./components/UpdateRunnerApp";
import { useDesktopSignIn } from "./hooks/useDesktopSignIn.hook";
import { type RunnerCheckResult } from "./hooks/useRunnerProvisioning";
import { useShellCloseRequest } from "./hooks/useShellCloseRequest.hook";

type RunnerStep = "install" | "update";

/** Union of all top-level setup states. */
type Step =
  | "service-url"
  | "desktop-update"
  | "sign-in"
  | { type: "runner"; kind: RunnerStep }
  | { type: "waiting" };

function App() {
  return <SetupFlow />;
}

function AppHeader() {
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <header className="absolute left-1 right-0 top-3 flex items-center justify-between px-8 py-6">
      <img src={isDark ? "/logo_light.svg" : "/logo.svg"} alt="Aventisia" className="h-7" />
      <div className="flex items-center gap-2">
        <ThemeSwitcher className="px-0" />
      </div>
    </header>
  );
}

function SetupFlow() {
  useShellCloseRequest();
  const [step, setStep] = useState<Step>("service-url");
  const [appBaseUrl, setAppBaseUrl] = useState("");
  const [checkResult, setCheckResult] = useState<RunnerCheckResult | null>(null);

  const handleDelivered = useCallback((url: string) => {
    window.location.href = url;
  }, []);

  const desktopSignIn = useDesktopSignIn(appBaseUrl, handleDelivered);

  const handleRunnerAppComplete = () => {
    setStep("sign-in");
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
      return;
    } catch {
      // Let the runner page surface the error so the user can retry.
    }

    setStep({ type: "runner", kind: "install" });
  };

  const handleServiceUrlContinue = (baseUrl: string) => {
    setAppBaseUrl(baseUrl);
    setStep("desktop-update");
  };

  const handleDesktopUpdateSkip = () => {
    void runRunnerCheck(appBaseUrl);
  };

  const handleDesktopUpdateInstall = () => {
    // The Rust install_update command restarts the app, which starts over at the URL screen.
  };

  const handleSignIn = async () => {
    const attempt = await desktopSignIn.start();

    if (attempt) {
      setStep({ type: "waiting" });
    }
  };

  const handleSignInCancel = async () => {
    await desktopSignIn.cancel();
    setStep("sign-in");
  };

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
      ) : step === "sign-in" ? (
        <SignInPage
          isStarting={desktopSignIn.isStarting}
          error={desktopSignIn.error}
          onSignIn={handleSignIn}
        />
      ) : step.type === "waiting" ? (
        <WaitingPage
          onOpenBrowserAgain={desktopSignIn.openBrowserAgain}
          onCancel={handleSignInCancel}
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
