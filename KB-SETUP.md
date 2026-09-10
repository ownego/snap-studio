# Setup tab KB — đưa file này cho Claude trên máy bạn

Mở Claude Code ngay trong thư mục repo và dán:

> Đọc `KB-SETUP.md` rồi setup tab KB trên máy này giúp tôi.

File này viết để một agent đọc và làm theo được. Mỗi bước có lệnh, kết quả mong đợi, và
cách xử lý khi hỏng. Ba việc agent **không** làm được (Chrome không cho) đánh dấu 👤 — đó
là phần của con người.

Chỉ muốn chụp ảnh + chú thích thôi thì **không cần file này**: nạp extension (bước 1) là
xong, xem [README](README.md) mục "Try it". Toàn bộ phần còn lại chỉ phục vụ tab KB.

---

## Bối cảnh — vì sao setup không chỉ là "cài rồi chạy"

Tab KB không đọc thẳng thư mục `kb/`. Nó hỏi một tiến trình node rời tên **snap-bridge**
qua WebSocket `127.0.0.1:8788`. Tiến trình đó:

- không tự bật lại sau khi khởi động máy;
- không thể được extension bật lên trực tiếp (trang extension không spawn được tiến trình).

Nên có nút **▶ Start bridge** trong tab KB, đi vòng qua **Chrome native messaging** — đường
duy nhất Chrome cho phép một extension chạm tới OS. Bước 3 bên dưới là cài cái cầu đó.
Thiết kế đầy đủ nằm ở [KB-BRIDGE.md](KB-BRIDGE.md), không cần đọc để setup.

`manifest.json` khai `"key"` cố định (2026-09-07) — ID của extension unpacked giờ **không đổi
theo đường dẫn thư mục nạp nó** nữa, khác hành vi mặc định của Chrome. Chuyển repo sang chỗ
khác không làm ID đổi, không cần chạy lại bước 3 vì lý do đó. Bộ cài ở bước 3 vẫn tự dò ID từ
hồ sơ Chrome (không nhập tay) — chỉ là giờ nó luôn dò ra cùng một giá trị trên mọi máy đã
`git clone` repo này, vì khoá công khai nằm sẵn trong `manifest.json` đã commit.

---

## Bước 0 — tiền đề

```bash
node --version    # cần 18 trở lên
```

Chưa có node thì cài trước (macOS: `brew install node`; Windows: winget/nodejs.org).

## Bước 1 👤 — nạp extension

`chrome://extensions` → bật **Developer mode** → **Load unpacked** → chọn **thư mục gốc
repo** (thư mục chứa `manifest.json`).

Agent không làm được bước này, và bước 3 **phụ thuộc vào nó**: bộ cài dò ID extension từ
hồ sơ Chrome, chưa nạp thì chưa có gì để dò.

## Bước 2 — cài dependency

```bash
cd snap-bridge
npm install
```

Kéo luôn Chromium của Playwright ([render.mjs](snap-bridge/render.mjs) dùng nó để render ảnh
KB đã chú thích), và chạy luôn bộ cài của bước 3 qua `postinstall` — nên output ở đây có cả
phần native host là bình thường. Nếu mạng chặn phần tải trình duyệt:

```bash
npx playwright install chromium
```

## Bước 3 — cài native messaging host

**macOS / Linux**

```bash
chmod +x snap-bridge/native-host/install.sh
./snap-bridge/native-host/install.sh
```

**Windows**

```powershell
powershell -ExecutionPolicy Bypass -File snap-bridge\native-host\install.ps1
```

Cả hai đều tự dò node và ID extension, rồi ghi ba thứ: shim (đường dẫn node tuyệt đối),
manifest, và chỗ đăng ký (registry `HKCU` trên Windows; thư mục `NativeMessagingHosts` của
trình duyệt trên mac/Linux — hai nền đó không có registry). Ba thứ này đều theo từng máy và
đã được gitignore.

Báo *"Không tìm thấy hồ sơ trình duyệt nào đang nạp Snap Studio unpacked"* → bước 1 chưa
xong, hoặc extension nạp từ thư mục khác. Nạp đúng thư mục rồi chạy lại, hoặc truyền ID
hiện trên `chrome://extensions`:

```bash
./snap-bridge/native-host/install.sh --extension-id <id>     # mac/Linux
# install.ps1 -ExtensionId <id>                              # Windows
```

## Bước 4 — kiểm tra

```bash
node snap-bridge/native-host/verify.mjs
```

Nó đi đúng chuỗi Chrome đi và bắt tay thật với shim đã cài (đây là thứ duy nhất chứng minh
đường dẫn node trong shim còn dùng được). Nó soát **từng trình duyệt** tìm thấy trên máy, nên
số dòng đổi theo máy — trên một máy Windows có cả Chrome lẫn Edge:

```
[ok]   host       …/snap-bridge/native-host/snap-bridge-host.mjs
[ok]   manifest   Chrome: …/com.snapstudio.bridge.json
[ok]   shim       …/snap-bridge-host.cmd
[ok]   id         Chrome: <id> khớp allowed_origins
[ok]   manifest   Edge: …
[ok]   shim       …
[?]    id         Edge: không thấy extension nạp unpacked từ repo này — bỏ qua đối chiếu
[ok]   bắt tay    {"ok":true,"running":false,"port":8788}

[i]    bridge     chưa chạy — bình thường; bấm "Start bridge" trong tab KB, hoặc: cd snap-bridge && npm start
```

Ba dòng cuối hay bị đọc nhầm thành hỏng, thực ra đều đạt: `[?]` là trình duyệt đó không nạp
Snap Studio (nạp ở Chrome là đủ), `bắt tay` là phép thử thật với shim, còn `bridge chưa chạy`
chính là việc của nút ở bước 6. Chốt bằng dòng cuối — `Tất cả đạt.` — và mã thoát `0`. Có dòng
`[LỖI]` nào thì sửa theo đúng câu nó nói rồi chạy lại; thoát khác 0 nghĩa là chưa đạt.

## Bước 5 👤 — reload extension

`chrome://extensions` → nút reload trên thẻ Snap Studio.

**Bắt buộc.** Quyền `nativeMessaging` chỉ được cấp khi nạp lại, và service worker
([bridge-worker.js](src/bridge-worker.js)) cũng chỉ nạp code mới lúc đó. Bỏ qua bước này thì
nút sẽ báo *"the extension's background worker didn't answer — reload Snap Studio"*.

## Bước 6 👤 — bấm nút

Mở Snap Studio → tab **KB**. Bridge chưa chạy thì đầu rail Articles có panel vàng
*"snap-bridge isn't running"*. Bấm **▶ Start bridge** → khoảng một giây sau panel biến mất
và danh sách bài tự hiện.

Thích terminal hơn thì `cd snap-bridge && npm start` cũng ra kết quả y hệt.

## Bước 7 — đăng ký MCP, để Claude Code lái được bridge

Sáu bước trên đủ cho tab KB *bên trong extension*. Muốn dùng skill `/kb` — Claude Code tự
chụp, tự chú thích, tự ghi `kb/<slug>.md` — thì snap-bridge phải được đăng ký làm MCP server:
skill đó chạy hoàn toàn bằng 24 tool `snap_*` mà bridge xuất ra (điều hướng bằng `snap_navigate`
/`snap_frame_*`, không phụ thuộc trình duyệt nào khác), không đăng ký thì nó không gọi được gì.

**Chạy sau bước 6, không sớm hơn.** Token nằm ở `snap-bridge/.token` và **chỉ sinh ra ở lần
server chạy đầu tiên** — đăng ký trước thì chưa có gì để đọc.

**Windows**

```powershell
$t = (Get-Content snap-bridge\.token -Raw).Trim()
claude mcp add --scope user --transport http snap http://127.0.0.1:8788/mcp --header "Authorization: Bearer $t"
```

**macOS / Linux**

```bash
claude mcp add --scope user --transport http snap http://127.0.0.1:8788/mcp --header "Authorization: Bearer $(tr -d '\n' < snap-bridge/.token)"
```

`--scope user` là bắt buộc chứ không phải gu cá nhân, và phải gõ ra: CLI mặc định `local`.
Hai lý do, cả hai đều đã cắn thật:

- **local scope** key theo đường dẫn project, mà case ổ đĩa Windows không nhất quán giữa các
  lần gọi CLI (`D:/…` vs `d:/…`) — cùng một thư mục ra hai key, tool "biến mất" giữa các phiên
  ([KB-BRIDGE.md](KB-BRIDGE.md) mục "Kết quả trial").
- **project scope** ghi `.mcp.json` vào repo, mà token thì tự sinh theo **từng máy** và bị
  gitignore. Vẫn dùng được, nhưng phải để nguyên placeholder `${SNAP_BRIDGE_TOKEN}` cho Claude
  Code giãn lúc nạp (thiếu biến thì server bị bỏ qua kèm cảnh báo *"Missing environment
  variables"*) — tức mỗi người vẫn phải tự export biến đó từ `.token` máy mình, cộng một lần
  duyệt tay `.mcp.json`. Còn `claude mcp add` thì **shell** giãn `$SNAP_BRIDGE_TOKEN` ngay lúc
  gõ và nướng token thật vào file — commit lên là phát token của máy này cho cả repo.

Kiểm tra — **mở lại Claude Code trước**, MCP server chỉ được nối lúc phiên khởi động (agent
đang đọc file này không tự làm được việc đó, phải là bạn):

```bash
claude mcp list
# snap: http://127.0.0.1:8788/mcp (HTTP) - ✔ Connected
```

Trong phiên thì gõ `/mcp`. Ra `✘ Failed to connect — ConnectionRefused` nghĩa là đăng ký đúng
nhưng bridge không chạy — quay lại bước 6.

**Chốt cả chuỗi**: trong phiên mới đó, bảo Claude gọi `snap_status`. Phải ra `{"connected":true}`
— nghĩa là Claude Code → MCP → snap-bridge → extension đã thông suốt từ đầu tới cuối. Ra
`{"connected":false}` thì service worker đang ngủ hoặc chưa nạp: chuyển qua lại một tab bất kỳ
trong Chrome (extension nghe `tabs.onActivated`, việc đó đánh thức nó), hoặc reload extension.
Cần có ít nhất một cửa sổ Chrome bình thường đang mở.

Xong bước này là dùng được `/kb` và `/kb-review` — hai skill đi theo repo ở `.claude/skills/`,
không phải cài thêm gì.

---

## Xong rồi thì sao

Rail rỗng là **đúng**: `kb/` bị gitignore, bài viết không đi theo repo. Bấm **+ New job**,
viết instruction, thêm session tab để agent dựng bài đầu tiên — hoặc dùng skill `/kb` trong
Claude Code.

Hai đường khác nhau ở một chỗ: **+ New job** chỉ cần bridge chạy (bước 6), còn `/kb` cần thêm
bước 7. Thiết kế đầy đủ của bề mặt MCP nằm ở [KB-BRIDGE.md](KB-BRIDGE.md).

---

## Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| Rail Articles trống, không có panel vàng | Bridge chạy nhưng `kb/` rỗng thật | Bình thường trên máy mới — tạo bài đầu tiên |
| Panel vàng, bấm nút báo *"launcher isn't registered"* | Chưa làm bước 3 | Chạy bộ cài, rồi reload extension |
| Bấm nút báo *"background worker didn't answer"* | Chưa reload sau khi cài | Bước 5 |
| `verify` báo `id ... không khớp allowed_origins` | ID pin từ `manifest.json` nên hiếm gặp giờ — nếu vẫn thấy: bộ cài chạy từ **trước** khi `manifest.json` có `"key"` (2026-09-07), ghi lại ID cũ | Chạy lại bộ cài, reload extension |
| `verify` báo lỗi ở dòng `bắt tay` | Đường dẫn node trong shim đã sai (gỡ/nâng cấp node, đổi nvm) | Chạy lại bộ cài |
| Job chạy nhưng không xuất được ảnh | Thiếu Chromium của Playwright | `npx playwright install chromium` |
| `/kb` không thấy tool `snap_*` nào | Bước 7 chưa xong, hoặc chưa mở lại Claude Code | Đăng ký rồi khởi động lại phiên |
| `claude mcp list` báo `snap ✘ ConnectionRefused` | Đăng ký đúng, bridge không chạy | Bước 6 |
| Tool `snap_*` "biến mất" giữa các phiên | Đăng ký nhầm local scope (key lệch theo case ổ đĩa) | Đăng ký lại `--scope user` |
| `snap_status` ra `{"connected":false}` | Service worker của Snap Studio đang ngủ / chưa nạp | Chuyển tab trong Chrome, hoặc reload extension; giữ một cửa sổ Chrome mở |

Bridge chết giữa chừng vì bất kỳ lý do gì: rail tự hiện lại panel vàng, và tự nạp lại danh
sách ngay khi bridge quay lại — không cần refresh trang.
