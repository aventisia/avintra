import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

import ServiceUrlPage from "./ServiceUrlPage";
import { TauriAppFooter } from "./TuariAppFooter";
import { GetRunnerApp } from "./components/GetRunnerApp";
import { UpdateRunnerApp } from "./components/UpdateRunnerApp";
import { type RunnerCheckResult } from "./hooks/useRunnerProvisioning";

type RunnerStep = "install" | "update";

type Step = "service-url" | { type: "runner"; kind: RunnerStep };

function App() {
  const [step, setStep] = useState<Step>("service-url");
  const [appBaseUrl, setAppBaseUrl] = useState("");
  const [checkResult, setCheckResult] = useState<RunnerCheckResult | null>(null);

  const handleServiceUrlContinue = async (baseUrl: string) => {
    setAppBaseUrl(baseUrl);

    try {
      const result = await invoke<RunnerCheckResult>("check_runner_app", {
        appBaseUrl: baseUrl,
      });
      setCheckResult(result);

      if (result.installed && !result.update_available) {
        window.location.href = `${baseUrl}/accounts/login`;
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

  const handleRunnerAppComplete = () => {
    // The runner is ready; proceed to the service login page.
    window.location.href = `${appBaseUrl}/accounts/login`;
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <header className="absolute left-1 right-0 top-3 flex items-center justify-between px-8 py-6">
        <img src="/logo.svg" alt="Aventisia" className="h-7" />
      </header>

      {step === "service-url" ? (
        <ServiceUrlPage onContinue={handleServiceUrlContinue} />
      ) : step.kind === "install" ? (
        <GetRunnerApp appBaseUrl={appBaseUrl} onComplete={handleRunnerAppComplete} />
      ) : checkResult ? (
        <UpdateRunnerApp
          appBaseUrl={appBaseUrl}
          currentVersion={checkResult.installed_version}
          latestVersion={checkResult.latest_version}
          onSkip={handleRunnerAppComplete}
          onComplete={handleRunnerAppComplete}
        />
      ) : null}

      <footer>
        <TauriAppFooter />
      </footer>
    </div>
  );
}

export default App;
