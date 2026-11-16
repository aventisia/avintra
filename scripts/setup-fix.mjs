// Installs the native npm binaries (esbuild, rollup, swc, canvas, turbo, ...) that a lockfile written on
// another OS leaves out, without changing package.json or package-lock.json. scripts/setup-fix.sh and
// scripts/setup-fix.ps1 run it; --help lists the options.
// IMPORTANT NOTE: npm 10 never installs optional platform binaries missing from the lockfile
// (https://github.com/npm/cli/issues/4828), and npm 11 installs them but writes them into the lockfile.
// So every install here passes --no-save, and each binary still missing is installed into a temporary
// project and copied next to the package that loads it, which also covers nested and workspace copies.
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const NPM_DIRS = ["clients/web-apps", "apis/corsair", "clients/docs", "tests/bruno", "tests/ui-builder-eval"];
const REINSTALL_DIR = "clients/web-apps";
const OS_TOKENS = { darwin: ["darwin"], linux: ["linux"], win32: ["win32", "windows"] };
const ARCH_TOKENS = { x64: ["x64", "64", "amd64"], arm64: ["arm64", "aarch64"], ia32: ["ia32"], arm: ["arm"] };
const LOAD_PROBES = new Map([
  ["esbuild", "m.transformSync('const a: number = 1', { loader: 'ts' })"],
  ["rollup", ""],
  ["@swc/core", ""],
  ["@napi-rs/canvas", ""],
]);

const USAGE = `setup-fix: install the native npm binaries (esbuild, rollup, swc, canvas, ...) that a lockfile
written on another OS leaves out. package.json and package-lock.json are never changed.

Usage (Linux/macOS: ./scripts/setup-fix.sh, Windows: .\\scripts\\setup-fix.ps1):
  (no option)                install missing native binaries
  --check      / -Check      report only, change nothing
  --reinstall  / -Reinstall  delete ${REINSTALL_DIR}/node_modules, reinstall with --no-save, then fix
  --help       / -Help       show this help

Rerun it after npm install or npm ci, which can remove binaries the lockfile does not list.`;

const libc = process.platform === "linux" ? (process.report.getReport().header.glibcVersionRuntime ? "glibc" : "musl") : null;

const step = (text) => console.log(`\n== ${text}`);
const ok = (text) => console.log(`   [ok] ${text}`);
const fail = (text) => console.log(`   [!!] ${text}`);
const skip = (text) => console.log(`   [--] ${text}`);
const pending = (text) => console.log(`   [..] ${text}`);
const indent = (text) => text.trim().replace(/^/gm, "        ");

function isForThisMachine(name) {
  const tokens = name.replace(/^@[^/]+\//, "").split("-");
  const osTokens = libc === "musl" ? [...OS_TOKENS.linux, "linuxmusl"] : OS_TOKENS[process.platform];
  const archTokens = ARCH_TOKENS[process.arch] ?? [process.arch];
  const at = tokens.findIndex((token, i) => osTokens.includes(token) && archTokens.includes(tokens[i + 1]));
  if (at < 0) return false;
  const excluded = libc === "musl" ? ["gnu"] : libc === "glibc" ? ["musl"] : ["gnu", "musl"];
  return !tokens.slice(at + 2).some((token) => excluded.some((prefix) => token.startsWith(prefix)));
}

function readPackage(dir) {
  try {
    return JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  } catch {
    return null;
  }
}

function listDir(dir) {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

function isInside(dir, root) {
  const rel = relative(root, dir);
  return !rel.startsWith("..") && !isAbsolute(rel);
}

function* installedPackages(dir, root, seen) {
  const pkg = readPackage(dir);
  if (pkg) yield { dir, pkg };
  const nodeModules = join(dir, "node_modules");
  for (const entry of listDir(nodeModules)) {
    if (entry.startsWith(".")) continue;
    const names = entry.startsWith("@") ? listDir(join(nodeModules, entry)).map((sub) => `${entry}/${sub}`) : [entry];
    for (const name of names) {
      let child;
      try {
        child = realpathSync(join(nodeModules, name));
      } catch {
        continue;
      }
      if (seen.has(child) || !isInside(child, root)) continue;
      seen.add(child);
      yield* installedPackages(child, root, seen);
    }
  }
}

function resolvedVersion(name, fromDir, root) {
  for (let dir = fromDir; isInside(dir, root); dir = dirname(dir)) {
    if (basename(dir) !== "node_modules") {
      const pkg = readPackage(join(dir, "node_modules", name));
      if (pkg) return pkg.version;
    }
    if (dir === root) break;
  }
  return null;
}

function siblingNodeModules(packageDir) {
  const parts = packageDir.split(sep);
  const at = parts.lastIndexOf("node_modules");
  return at < 0 ? join(packageDir, "node_modules") : parts.slice(0, at + 1).join(sep);
}

function loadSemver(root) {
  try {
    return createRequire(join(root, "package.json"))("semver");
  } catch {
    return null;
  }
}

function findMissing(root, packages) {
  const semver = loadSemver(root);
  const missing = new Map();
  for (const { dir, pkg } of packages) {
    for (const [name, wanted] of Object.entries(pkg.optionalDependencies ?? {})) {
      if (/[:/]/.test(wanted) || !isForThisMachine(name)) continue;
      const version = resolvedVersion(name, dir, root);
      if (version && (semver ? semver.satisfies(version, wanted) : version === wanted)) continue;
      const target = join(siblingNodeModules(dir), name);
      if (!missing.has(target)) missing.set(target, { name, wanted, target });
    }
  }
  return [...missing.values()];
}

function groupIntoRounds(missing) {
  const groups = new Map();
  for (const { name, wanted, target } of missing) {
    const key = `${name}@${wanted}`;
    if (!groups.has(key)) groups.set(key, { name, wanted, targets: [] });
    groups.get(key).targets.push(target);
  }
  const rounds = [];
  for (const group of groups.values()) {
    let round = rounds.find((candidate) => !candidate.has(group.name));
    if (!round) rounds.push((round = new Map()));
    round.set(group.name, group);
  }
  return rounds;
}

// IMPORTANT NOTE: Windows runs npm as npm.cmd, which Node spawns only through a shell; args are fixed literals.
function runNpm(cwd, args, { live = false } = {}) {
  const result = spawnSync(`npm ${args.join(" ")}`, {
    cwd,
    shell: true,
    encoding: "utf8",
    stdio: live ? "inherit" : "pipe",
  });
  return { ok: result.status === 0, output: `${result.stdout ?? ""}${result.stderr ?? ""}${result.error?.message ?? ""}` };
}

function installRound(npmDir, round) {
  const scratch = mkdtempSync(join(tmpdir(), "setup-fix-"));
  try {
    const optionalDependencies = Object.fromEntries([...round.values()].map(({ name, wanted }) => [name, wanted]));
    writeFileSync(join(scratch, "package.json"), JSON.stringify({ name: "setup-fix", private: true, optionalDependencies }));
    if (existsSync(join(npmDir, ".npmrc"))) copyFileSync(join(npmDir, ".npmrc"), join(scratch, ".npmrc"));
    const npm = runNpm(scratch, ["install", "--no-package-lock", "--ignore-scripts", "--no-audit", "--no-fund"]);
    for (const { name, targets } of round.values()) {
      const source = join(scratch, "node_modules", name);
      if (!existsSync(join(source, "package.json"))) continue;
      for (const target of targets) {
        rmSync(target, { recursive: true, force: true, maxRetries: 3 });
        mkdirSync(dirname(target), { recursive: true });
        cpSync(source, target, { recursive: true });
      }
    }
    return npm.output;
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

function fixDir(rel, checkOnly) {
  const npmDir = join(ROOT, rel);
  if (!existsSync(join(npmDir, "package.json"))) {
    skip(`${rel} (no package.json)`);
    return true;
  }
  if (!existsSync(join(npmDir, "node_modules"))) {
    skip(`${rel} (node_modules not installed, skipped)`);
    return true;
  }

  const root = realpathSync(npmDir);
  const packages = [...installedPackages(root, root, new Set([root]))];
  const missing = findMissing(root, packages);
  if (missing.length === 0) {
    ok(`${rel} (no missing native binaries)`);
    return true;
  }

  for (const { wanted, target } of missing) pending(`${rel}: missing ${relative(root, target)}@${wanted}`);
  if (checkOnly) {
    fail(`${rel} (not fixed: --check)`);
    return false;
  }

  let npmOutput = "";
  try {
    for (const round of groupIntoRounds(missing)) npmOutput += installRound(npmDir, round);
  } catch (error) {
    fail(`${rel}: ${error.message}`);
    fail("a running service may hold the file open; stop the stack (dekit down) and rerun");
    return false;
  }

  const stillMissing = findMissing(root, packages);
  if (stillMissing.length === 0) {
    ok(`${rel} (installed ${missing.length} native binaries)`);
    return true;
  }
  for (const { wanted, target } of stillMissing) fail(`${rel}: could not install ${relative(root, target)}@${wanted}`);
  if (npmOutput.trim()) console.log(indent(npmOutput));
  return false;
}

function probeLoads(rel) {
  const npmDir = join(ROOT, rel);
  if (!existsSync(join(npmDir, "node_modules"))) return true;
  const root = realpathSync(npmDir);
  let loaded = true;
  for (const { dir, pkg } of installedPackages(root, root, new Set([root]))) {
    if (!LOAD_PROBES.has(pkg.name)) continue;
    const code = `const m = require(${JSON.stringify(dir)}); ${LOAD_PROBES.get(pkg.name)}`;
    const result = spawnSync(process.execPath, ["-e", code], { cwd: root, encoding: "utf8" });
    const where = `${rel}/${relative(root, dir).split(sep).join("/")}`;
    if (result.status === 0) {
      ok(`${where} loads`);
    } else {
      const reason = (result.stderr ?? "").split("\n").find((line) => /^[\w.]*Error\b/.test(line)) ?? "unknown error";
      fail(`${where} does not load: ${reason.slice(0, 160)}`);
      loaded = false;
    }
  }
  return loaded;
}

function reinstall() {
  const npmDir = join(ROOT, REINSTALL_DIR);
  step(`Reinstalling ${REINSTALL_DIR}/node_modules (npm install --no-save)`);
  try {
    rmSync(join(npmDir, "node_modules"), { recursive: true, force: true, maxRetries: 3 });
  } catch (error) {
    fail(`${error.message}; stop the stack (dekit down) and rerun`);
    return false;
  }
  if (runNpm(npmDir, ["install", "--no-save", "--force", "--no-audit", "--no-fund"], { live: true }).ok) return true;
  fail(`npm install failed in ${REINSTALL_DIR}; see the npm output above`);
  return false;
}

const args = process.argv.slice(2);
const unknown = args.find((arg) => !["--check", "--reinstall", "--help", "-h"].includes(arg));
if (args.includes("--help") || args.includes("-h")) {
  console.log(USAGE);
  process.exit(0);
}
if (unknown) {
  console.error(`error: unknown option ${unknown}\n\n${USAGE}`);
  process.exit(2);
}
const checkOnly = args.includes("--check");
if (checkOnly && args.includes("--reinstall")) {
  console.error("error: --reinstall cannot be combined with --check");
  process.exit(2);
}
if (!OS_TOKENS[process.platform]) {
  console.error(`error: unsupported platform ${process.platform}`);
  process.exit(2);
}

console.log(`setup-fix: ${ROOT} (${process.platform} ${process.arch}${libc ? ` ${libc}` : ""})`);
if (args.includes("--reinstall") && !reinstall()) process.exit(1);

let failed = false;
step(checkOnly ? "Checking native binaries" : "Installing missing native binaries");
for (const rel of NPM_DIRS) failed = !fixDir(rel, checkOnly) || failed;
step("Checking native modules load");
for (const rel of NPM_DIRS) failed = !probeLoads(rel) || failed;

if (failed) {
  console.error("\nSome checks failed; see the lines marked [!!] above.");
  process.exit(1);
}
console.log("\nDone. Restart the affected services (dekit restart <service>).");
