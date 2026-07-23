import { IS_TAURI } from "@avplatform/ui/constants";
import { toast } from "@avplatform/ui/sonner";

export async function killBinaries(): Promise<boolean> {
  // Not running in Tauri, skip killing binaries
  if (!IS_TAURI) {
    return false;
  }

  // Dynamically import Tauri APIs to avoid errors in browser
  const { platform } = await import("@tauri-apps/plugin-os");
  const { Command } = await import("@tauri-apps/plugin-shell");

  // Determine the platform and return the appropriate command to kill UIInspector
  const platformName = await platform();
  if (!platformName) {
    toast.error("Unable to determine platform.");
    return false;
  }

  // Create commands to kill UIInspector and NodeExecutor based on the platform
  let uiInspectorKillCmd = null;
  let nodeExecutorKillCmd = null;
  if (platformName === "windows") {
    uiInspectorKillCmd = Command.create("taskkill", ["/F", "/IM", "UIInspector.exe"]);
    nodeExecutorKillCmd = Command.create("taskkill", ["/F", "/IM", "NodeExecutor.exe"]);
  } else if (platformName === "macos" || platformName === "linux") {
    uiInspectorKillCmd = Command.create("pkill", ["-f", "UIInspector"]);
    nodeExecutorKillCmd = Command.create("pkill", ["-f", "NodeExecutor"]);
  } else {
    toast.error("Unsupported platform for killing binaries.");
    return false;
  }

  // Execute the commands
  try {
    console.log("UIInspector kill command executed:", await uiInspectorKillCmd?.execute());
    console.log("NodeExecutor kill command executed:", await nodeExecutorKillCmd?.execute());
  } catch (error) {
    console.error("Failed to kill binaries:", error);
    return false;
  }

  // Return true if both commands were executed successfully
  return true;
}
