/* port.js — the one place that decides which port snap-bridge lives on.
 *
 * Four readers have to agree on the answer and only one of them is a normal
 * process you can pass a flag to: the server, the native host Chrome spawns,
 * verify.mjs, and — through the host's replies — the extension's WebSocket.
 * A constant worked until the day something else already owned 8788; an env
 * var alone did not, because the native host inherits CHROME's environment,
 * not the environment of whatever shell you set the variable in.
 *
 * So the order is: SNAP_BRIDGE_PORT (one run, one shell, deliberate) beats
 * `.port` (written once at setup by choose-port.mjs, per machine, gitignored)
 * beats 8788. Everything else in this repo asks resolvePort() rather than
 * reading any of that itself.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import http from "node:http";
import net from "node:net";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

export const DEFAULT_PORT = 8788;
export const PORT_FILE = path.join(HERE, ".port");
export const HOST = "127.0.0.1";

function valid(port) {
  return Number.isInteger(port) && port > 0 && port < 65536;
}

/** The machine's chosen port, or null when setup never had to move it. */
export function readPortFile() {
  if (!existsSync(PORT_FILE)) return null;
  const port = Number(String(readFileSync(PORT_FILE, "utf8")).trim());
  return valid(port) ? port : null;
}

export function writePortFile(port) {
  if (!valid(port)) throw new Error(`refusing to write an invalid port: ${port}`);
  writeFileSync(PORT_FILE, String(port), "utf8");
  return port;
}

export function resolvePort() {
  const fromEnv = Number(process.env.SNAP_BRIDGE_PORT);
  if (valid(fromEnv)) return fromEnv;
  return readPortFile() ?? DEFAULT_PORT;
}

/** Where the port came from — for messages that would otherwise leave someone
 *  wondering why the bridge is not on 8788. */
export function portSource() {
  if (valid(Number(process.env.SNAP_BRIDGE_PORT))) return "SNAP_BRIDGE_PORT";
  if (readPortFile() != null) return "snap-bridge/.port";
  return "default";
}

/** Three answers, not two. A bare TCP connect cannot tell OUR server from
 *  whatever else grabbed the port, and counting a stranger as "already
 *  running" is how a launcher reports success while the extension's socket
 *  keeps bouncing off someone else's server.
 *
 *  "free"    nothing is listening
 *  "ours"    snap-bridge answered /health
 *  "foreign" someone is there, but not us
 */
export function inspectPort(port, timeoutMs = 900) {
  return new Promise((resolve) => {
    const req = http.get({ host: HOST, port, path: "/health", timeout: timeoutMs }, (res) => {
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
    // ECONNREFUSED is the only error meaning "nobody is home"; a reset or a
    // protocol error means somebody is, just not us.
    req.on("error", (e) => resolve(e && e.code === "ECONNREFUSED" ? "free" : "foreign"));
  });
}

/** Can we actually bind it? inspectPort() only proves nobody answered — a
 *  socket bound to another interface, or one in TIME_WAIT, still refuses the
 *  bind later, and finding that out at setup beats finding it out from a
 *  crash on first launch. */
export function canBind(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => resolve(false));
    srv.listen(port, HOST, () => srv.close(() => resolve(true)));
  });
}

/** Pick a port for this machine: keep `preferred` when it is ours or free,
 *  otherwise walk upward to the first port that is both silent and bindable.
 *  Returns what it chose and whether that is a move. */
export async function choosePort(preferred = resolvePort(), span = 20) {
  const state = await inspectPort(preferred);
  if (state === "ours") return { port: preferred, state, moved: false };
  if (state === "free" && await canBind(preferred)) return { port: preferred, state, moved: false };

  for (let port = preferred + 1; port <= preferred + span; port++) {
    if (await inspectPort(port) === "free" && await canBind(port)) {
      return { port, state, moved: true, from: preferred };
    }
  }
  return { port: null, state, moved: false, from: preferred };
}
