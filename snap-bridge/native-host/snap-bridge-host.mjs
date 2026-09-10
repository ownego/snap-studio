#!/usr/bin/env node
/* snap-bridge-host.mjs — Chrome native messaging host, the one thing that lets
   Snap Studio's "Start bridge" button actually start a process.

   Why this file exists: an extension page cannot spawn anything. The KB tab
   talks to snap-bridge over ws://127.0.0.1:8788/ext (src/bridge-worker.js),
   and when that process is not running — after a reboot, most often — kb_list
   fails and the job board looks empty even though kb/ is full of articles.
   Native messaging is Chrome's only sanctioned way out to the OS, so this is
   a deliberately tiny host: it answers "is it up?" and "bring it up", nothing
   else. It never takes a path, a command, or an argument from the extension —
   what it spawns is hardcoded to ../server.js right next door — so the widest
   thing a compromised page could do through it is start this repo's own bridge.

   Protocol (Chrome's, not ours): one message in, one message out, each framed
   as a 4-byte little-endian length followed by UTF-8 JSON, over stdio.
   chrome.runtime.sendNativeMessage() starts this process, sends one message,
   reads one reply and closes the pipe — so we exit after answering.

   NOTHING may be written to stdout except a framed reply: a stray console.log
   corrupts the frame and Chrome kills the connection with an opaque error.
   Diagnostics go to stderr, which Chrome discards.

   Installed (manifest + registry key + the .cmd shim Chrome actually
   launches) by install.ps1 in this folder. */
import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, openSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BRIDGE_DIR = path.resolve(__dirname, "..");
const SERVER_JS = path.join(BRIDGE_DIR, "server.js");
const LOG_DIR = path.join(BRIDGE_DIR, "logs");
const PORT = Number(process.env.SNAP_BRIDGE_PORT || 8788);
const HOST = "127.0.0.1";

/** Three answers, not two. A bare TCP connect (what this used to do) cannot
 *  tell OUR server from whatever else grabbed the port, and counting a stranger
 *  as "already running" is exactly how the button reported success while the
 *  extension's socket kept bouncing off someone else's server. /health is
 *  unauthenticated for this one reason.
 *
 *  "free"    nothing is listening      -> safe to spawn
 *  "ours"    snap-bridge answered      -> already running
 *  "foreign" someone else is there     -> spawning would only crash on bind */
function inspect(timeoutMs = 900) {
  return new Promise((resolve) => {
    const req = http.get({ host: HOST, port: PORT, path: "/health", timeout: timeoutMs }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (c) => { if (body.length < 512) body += c; });
      res.on("end", () => {
        let parsed;
        try { parsed = JSON.parse(body); } catch { parsed = null; }
        resolve(parsed && parsed.service === "snap-bridge" ? "ours" : "foreign");
      });
    });
    req.on("timeout", () => { req.destroy(); resolve("foreign"); });
    // ECONNREFUSED is the only error that means "nobody is home"; a reset or a
    // protocol error means somebody is, just not us.
    req.on("error", (e) => resolve(e && e.code === "ECONNREFUSED" ? "free" : "foreign"));
  });
}

/** Poll until the freshly spawned server is actually accepting connections.
 *  Replying the instant spawn() returns would be a lie: the extension would
 *  retry its WebSocket, fail, and the button would look broken. */
async function waitUntilUp(deadlineMs = 12000) {
  const until = Date.now() + deadlineMs;
  while (Date.now() < until) {
    if (await inspect() === "ours") return true;
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

/** Detached + unref'd, with stdio pointed at real files rather than this
 *  process's pipes — both are required for the server to outlive us. We are a
 *  child of Chrome and exit within milliseconds of answering; a child still
 *  holding our stdout would die with us. */
function spawnBridge() {
  mkdirSync(LOG_DIR, { recursive: true });
  const out = openSync(path.join(LOG_DIR, "bridge.log"), "a");
  const err = openSync(path.join(LOG_DIR, "bridge.err.log"), "a");
  const child = spawn(process.execPath, [SERVER_JS], {
    cwd: BRIDGE_DIR,
    detached: true,
    windowsHide: true,
    stdio: ["ignore", out, err],
  });
  child.unref();
  return child.pid;
}

const PORT_TAKEN = `port ${PORT} is held by another process, not snap-bridge. Free it, or move the bridge: set SNAP_BRIDGE_PORT where Chrome can see it (setx on Windows, launchctl setenv on macOS), restart Chrome, and re-register the snap MCP server on the new port — KB-SETUP.md, "Cổng 8788 bị chiếm".`;

async function handle(msg) {
  const cmd = msg && msg.cmd;
  if (cmd === "status") {
    const state = await inspect();
    // portBusy travels with every status reply so the extension can say why the
    // socket will not come up, instead of retrying into a stranger forever.
    return { ok: true, running: state === "ours", portBusy: state === "foreign", port: PORT };
  }
  if (cmd === "start") {
    const state = await inspect();
    if (state === "ours") return { ok: true, running: true, already: true, port: PORT };
    if (state === "foreign") return { ok: false, portBusy: true, port: PORT, error: PORT_TAKEN };
    let pid;
    try { pid = spawnBridge(); }
    catch (e) { return { ok: false, error: `could not spawn snap-bridge: ${e.message}` }; }
    const up = await waitUntilUp();
    return up
      ? { ok: true, running: true, already: false, pid, port: PORT }
      : { ok: false, error: `snap-bridge was spawned (pid ${pid}) but nothing is listening on ${HOST}:${PORT} — see snap-bridge/logs/bridge.err.log` };
  }
  return { ok: false, error: `unknown command "${cmd}"` };
}

function send(obj) {
  const body = Buffer.from(JSON.stringify(obj), "utf8");
  const header = Buffer.alloc(4);
  header.writeUInt32LE(body.length, 0);
  process.stdout.write(Buffer.concat([header, body]));
}

// One message in, one out. Chrome frames every message the same way; we only
// ever read the first one, since sendNativeMessage() never sends a second.
let buf = Buffer.alloc(0);
let answered = false;
process.stdin.on("data", async (chunk) => {
  if (answered) return;
  buf = Buffer.concat([buf, chunk]);
  if (buf.length < 4) return;
  const len = buf.readUInt32LE(0);
  if (buf.length < 4 + len) return;
  answered = true;
  let msg;
  try { msg = JSON.parse(buf.subarray(4, 4 + len).toString("utf8")); }
  catch { send({ ok: false, error: "malformed message" }); process.exit(0); return; }
  let reply;
  try { reply = await handle(msg); }
  catch (e) { reply = { ok: false, error: String((e && e.message) || e) }; }
  send(reply);
  // Give the write a tick to flush before the process goes away.
  setTimeout(() => process.exit(0), 50);
});
// Chrome closed the pipe without a complete message — nothing to answer.
process.stdin.on("end", () => { if (!answered) process.exit(0); });
