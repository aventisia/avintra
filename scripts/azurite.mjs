// Runs the Azure Storage emulator the .NET APIs reach through UseDevelopmentStorage=true.
// IMPORTANT NOTE: that connection string always means 127.0.0.1:10000, so every checkout and worktree
// shares one emulator; when another checkout already serves the port, this task waits instead of failing.
import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import { homedir } from "node:os";
import { join } from "node:path";

const AZURITE_VERSION = "3.37.0";
const BLOB_PORT = 10000;
const dataDir = join(homedir(), ".azurite");

const isPortServed = () =>
  new Promise((resolve) => {
    const socket = createConnection({ host: "127.0.0.1", port: BLOB_PORT });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });

if (await isPortServed()) {
  console.log(`Azurite is already serving 127.0.0.1:${BLOB_PORT} for another checkout; using it.`);
  setInterval(() => {}, 1 << 30);
} else {
  console.log(`Starting Azurite ${AZURITE_VERSION} on 127.0.0.1:${BLOB_PORT}, data in ${dataDir}`);
  const azurite = spawn(
    `npx --yes azurite@${AZURITE_VERSION} --silent --skipApiVersionCheck --location "${dataDir}"`,
    { stdio: "inherit", shell: true },
  );
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => azurite.kill(signal));
  azurite.on("exit", (code) => process.exit(code ?? 0));
}
