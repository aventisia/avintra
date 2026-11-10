import { Store } from "@tauri-apps/plugin-store";

const STORE_NAME = "desktop-app-setup.json";
const SETUP_STEP_KEY = "setupStep";
const SERVICE_URL_KEY = "serviceUrl";

export type SetupStep = "service-url" | "desktop-update" | "runner" | "login";

let storeInstance: Store | null = null;
let tauriUnavailable = false;

/** True when running inside the Tauri webview (IPC available). */
export function isTauriEnv(): boolean {
  return (
    typeof window !== "undefined" &&
    (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ !== undefined
  );
}

async function getStore(): Promise<Store | null> {
  if (tauriUnavailable) return null;
  if (!storeInstance) {
    try {
      storeInstance = await Store.load(STORE_NAME);
    } catch {
      tauriUnavailable = true;
      return null;
    }
  }
  return storeInstance;
}

export async function getSavedSetupStep(): Promise<SetupStep | null> {
  if (!isTauriEnv()) return null;
  const store = await getStore();
  if (!store) return null;
  const value = await store.get<SetupStep>(SETUP_STEP_KEY);
  return value ?? null;
}

export async function setSetupStep(step: SetupStep | null): Promise<void> {
  if (!isTauriEnv()) return;
  const store = await getStore();
  if (!store) return;
  if (step === null) {
    await store.delete(SETUP_STEP_KEY);
  } else {
    await store.set(SETUP_STEP_KEY, step);
  }
  await store.save();
}

export async function getSavedServiceUrl(): Promise<string | null> {
  if (!isTauriEnv()) return null;
  const store = await getStore();
  if (!store) return null;
  const value = await store.get<string>(SERVICE_URL_KEY);
  return value ?? null;
}

export async function setSavedServiceUrl(url: string | null): Promise<void> {
  if (!isTauriEnv()) return;
  const store = await getStore();
  if (!store) return;
  if (url === null) {
    await store.delete(SERVICE_URL_KEY);
  } else {
    await store.set(SERVICE_URL_KEY, url);
  }
  await store.save();
}

export async function clearSetupState(): Promise<void> {
  if (!isTauriEnv()) return;
  const store = await getStore();
  if (!store) return;
  await store.delete(SETUP_STEP_KEY);
  await store.delete(SERVICE_URL_KEY);
  await store.save();
}
