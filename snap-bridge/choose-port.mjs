#!/usr/bin/env node
/* choose-port.mjs — settle which port this machine's snap-bridge uses, at
 * setup time rather than at the first confusing failure.
 *
 * `npm install` runs this (via native-host/postinstall.mjs) before anything
 * else, so a machine where something already owns 8788 is moved off it before
 * the extension, the launcher button or the MCP registration ever look at a
 * port. Run it by hand to force one:
 *
 *   node snap-bridge/choose-port.mjs              # keep 8788 if it is free
 *   node snap-bridge/choose-port.mjs --port 8790  # force, and write it down
 *   node snap-bridge/choose-port.mjs --print      # just say what is in effect
 *
 * The answer lands in snap-bridge/.port (gitignored, per machine) — which is
 * what server.js, the native host, verify.mjs and therefore the extension all
 * read through port.js.
 */
import { choosePort, inspectPort, canBind, readPortFile, writePortFile, resolvePort, portSource, DEFAULT_PORT, PORT_FILE } from "./port.js";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const valueOf = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? Number(args[i + 1]) : NaN;
};

const inEffect = resolvePort();

if (flag("--print")) {
  // stdout is the number alone, so a shell can capture it without parsing:
  //   PORT=$(node snap-bridge/choose-port.mjs --print)
  console.log(String(inEffect));
  console.error(`(from ${portSource()})`);
  process.exit(0);
}

if (process.env.SNAP_BRIDGE_PORT) {
  // An env var is someone overriding on purpose for this shell; rewriting the
  // file underneath them would be answering a question they did not ask.
  console.log(`[port] SNAP_BRIDGE_PORT=${process.env.SNAP_BRIDGE_PORT} đang override — không đụng vào ${PORT_FILE}.`);
  process.exit(0);
}

const forced = valueOf("--port");
if (args.includes("--port")) {
  if (!Number.isInteger(forced) || forced <= 0 || forced >= 65536) {
    console.error(`[port] --port cần một số cổng hợp lệ, nhận được: ${args[args.indexOf("--port") + 1]}`);
    process.exit(1);
  }
  const state = await inspectPort(forced);
  if (state === "foreign") {
    console.error(`[port] cổng ${forced} đang bị một tiến trình KHÁC giữ — chọn cổng khác, hoặc nhả nó trước.`);
    process.exit(1);
  }
  if (state === "free" && !(await canBind(forced))) {
    console.error(`[port] cổng ${forced} không bind được (có thể đang bị giữ trên interface khác).`);
    process.exit(1);
  }
  writePortFile(forced);
  console.log(`[port] đã ghim cổng ${forced} vào ${PORT_FILE}.`);
  console.log(`[port] Nhớ đăng ký lại MCP theo cổng này (KB-SETUP.md bước 7) và reload extension.`);
  process.exit(0);
}

const preferred = readPortFile() ?? DEFAULT_PORT;
const result = await choosePort(preferred);

if (result.port === null) {
  console.error(`[port] cổng ${preferred} bị chiếm và 20 cổng kế tiếp cũng không dùng được.`);
  console.error(`[port] Nhả bớt cổng, hoặc chọn tay: node snap-bridge/choose-port.mjs --port <port>`);
  process.exit(1);
}

if (!result.moved) {
  const note = result.state === "ours" ? "snap-bridge đang chạy sẵn ở đó" : "còn trống";
  console.log(`[port] dùng cổng ${result.port} — ${note}.`);
  process.exit(0);
}

writePortFile(result.port);
console.log(`[port] cổng ${result.from} đang bị một tiến trình khác giữ → chuyển sang ${result.port}.`);
console.log(`[port] Đã ghi ${PORT_FILE}; server, native host và verify đều đọc từ đó, extension học lại cổng từ native host.`);
console.log(`[port] Việc còn lại của bạn: đăng ký MCP theo cổng ${result.port} (KB-SETUP.md bước 7). Đã đăng ký ở cổng cũ thì "claude mcp remove snap" rồi làm lại.`);
