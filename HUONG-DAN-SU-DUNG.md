# Hướng dẫn sử dụng Snap Studio

Tài liệu này hướng dẫn cách **dùng** Snap Studio (chụp — chú thích — xuất ảnh — lưu — dựng bài
KB). Muốn biết kiến trúc kỹ thuật, giới hạn của bản V1, hay cách hệ thống token/CSS hoạt động,
xem [README.md](README.md).

## 1. Snap Studio là gì

Một tiện ích mở rộng Chrome giúp chụp nhanh một trang, chú thích lên ảnh (đánh số bước, khoanh
vùng, mũi tên, che thông tin nhạy cảm...) rồi sao chép/xuất ảnh để dán vào ticket hoặc tài liệu.
Bốn tab trên topbar:

| Tab | Dùng để |
|---|---|
| **Snap** | Chú thích ảnh — tab chính, mục 4-11 bên dưới. |
| **Library** | Thư viện các ảnh đã lưu, tự xoá sau một số ngày — mục 12. |
| **Components** | Xem trước bộ component của kit, tạo component riêng — mục 13. |
| **KB** | Dựng bài hướng dẫn (KB article) hoàn chỉnh từ một agent, cần cài thêm — mục 14. |

Có thể mở nhiều ảnh cùng lúc (mục 5) — snap một ảnh mới không làm mất ảnh đang mở.

## 2. Cài đặt

### 2.1. Cài đặt cơ bản — đủ dùng 3 tab đầu (Snap / Library / Components)

1. Mở `chrome://extensions`.
2. Bật **Developer mode** (góc trên bên phải).
3. Bấm **Load unpacked**, chọn thư mục gốc của repo này.
4. Icon Snap Studio xuất hiện trên thanh công cụ Chrome.

> Vì chưa đóng gói (unpacked), font tải từ Google Fonts — chỉ hoạt động ở chế độ dev, không phải
> bản đóng gói cuối cùng.

### 2.2. Cài thêm cho tab KB

Tab **KB** không đọc thẳng thư mục `kb/` — nó cần một tiến trình node riêng (`snap-bridge`) và
một native messaging host để extension bật được tiến trình đó. Việc này không nằm trong 4 bước
trên. Làm theo [KB-SETUP.md](KB-SETUP.md) — file đó viết để đưa thẳng cho Claude Code trong repo
này làm giúp ("đọc `KB-SETUP.md` rồi setup tab KB trên máy này giúp tôi"). Chỉ dùng 3 tab đầu thì
bỏ qua bước này.

## 3. Chụp màn hình

Bấm icon Snap Studio trên toolbar để mở popup, có 4 lựa chọn:

| Nút | Chức năng | Phím tắt |
|---|---|---|
| Open Snap Studio | Mở thẳng editor, không chụp gì | — |
| 📸 Snap visible tab | Chụp toàn bộ phần đang hiển thị của tab | `Alt+Shift+S` |
| ▭ Snap a region… | Kéo chọn một vùng trên trang để chụp | `Alt+Shift+R` |
| 🖥 Snap a window/screen… | Mở bộ chọn cửa sổ/màn hình của Chrome — chụp một app khác, màn hình phụ, hoặc cả desktop | `Ctrl+Shift+9` |

`Ctrl+Shift+9` là phím tắt **toàn cục** — bấm được cả khi Chrome không phải cửa sổ đang focus,
vì Chrome chỉ cho phép điều đó với tổ hợp `Ctrl+Shift+[0-9]`. Chụp theo cách này không kéo-chọn
vùng được trực tiếp (không chèn được lớp chọn vùng vào cửa sổ của app khác) — công cụ **Crop**
(mục 7) mở sẵn trên toàn khung ngay sau khi chụp để cắt lại nếu cần.

Chụp xong (bằng cách nào cũng vậy), ảnh mở ra như **một tab mới** trong dải tab phía trên canvas
của editor — không đè lên ảnh đang mở (xem mục 5).

Đang kéo chọn vùng mà muốn hủy → nhấn `Esc`.

## 4. Làm quen giao diện editor

- **Thanh trên (topbar)**: 4 tab **Snap / Library / Components / KB** (mục 1), và bên phải là
  nút riêng cho tab đang mở — ở Snap là nút **⛶ Crop** (mục 7), 2 công tắc **Image frame** /
  **Context stamp** (mục 10), và **⧉ Copy image** / **⬇ Export PNG** (mục 11).
- **Dải tab phía trên canvas** (chỉ ở Snap): mỗi ảnh đang mở là một tab riêng — mục 5.
- **Cột trái**: hộp công cụ chú thích (**Components**), rồi đến **Yours** (component tự tạo ở tab
  Components), cuối cùng là **Layers** — danh sách các lớp đang có trên ảnh.
- **Giữa**: canvas — nơi ảnh và các chú thích hiển thị, kéo/thả/resize trực tiếp tại đây.
- **Phải**: bảng **Properties** của phần tử đang chọn (sửa chữ, màu, kích thước, biến thể...).

## 5. Mở nhiều ảnh cùng lúc

Mỗi lần chụp, dán, upload, hoặc mở lại một ảnh từ Library đều tạo **một tab riêng** trong dải tab
phía trên canvas — không ảnh nào bị ghi đè hay mất chú thích.

- Bấm vào một tab để chuyển qua ảnh đó (ví dụ để copy một lớp/ảnh sang tab khác).
- Bấm **✕** trên tab để đóng nó. Đóng tab, **Replace base image…**, và áp dụng Crop đều xoá vĩnh
  viễn ảnh (hoặc phần pixel bị cắt) đó — không tự lưu vào Library trước. Đóng tab và Replace base
  image đều hỏi xác nhận trước khi làm; Crop thì không (vì Crop không làm mất chú thích nào, chỉ
  dời vị trí — xem mục 7). Muốn giữ lại, bấm **⤓ Save to library** (mục 12) trước khi làm bất kỳ
  thao tác nào trong ba thao tác trên.

## 6. Các công cụ chú thích

Bấm một nút trong cột trái để thả component vào giữa canvas, sau đó kéo vào đúng vị trí và chỉnh
trong bảng Properties bên phải. Riêng **Highlight, Spotlight, Zoom, Privacy Blur** đổi con trỏ
thành dấu cộng — kéo-thả trực tiếp trên ảnh để vẽ đúng vùng và kích thước muốn, thay vì thả giữa
canvas rồi kéo lại.

| Công cụ | Dùng khi nào |
|---|---|
| ① **Step Marker** | Đánh số một bước trên ảnh cần tự giải thích được (không có bài viết đi kèm). Có biến thể `--compact` (số trần) khi ảnh đã nằm cạnh văn bản step-by-step riêng, và `--video` cho khung hình video. |
| 💬 **Text / Explanation Box** | Thẻ giải thích bằng chữ đặt ngay trên ảnh. Chế độ `step` gắn kèm badge số bước; chế độ `note` dùng cho một mẹo/lưu ý không gắn với bước nào. Không dùng cả step-marker rời **và** text-box chế độ step cho cùng một bước — bị trùng nhãn. |
| ⬚ **Highlight Box** | Khoanh vùng để thu hút chú ý. Mặc định viền (bordered) khi đã có mũi tên/step-marker chỉ vào cùng vùng đó; chỉ dùng biến thể `--shaded` (tô nền) khi ô này phải tự gánh toàn bộ sự chú ý, không có gì khác trỏ vào. Vùng có chữ/chi tiết nhỏ luôn dùng bordered — shaded làm giảm tương phản chữ. |
| ◎ **Spotlight** | Làm tối cả khung hình, chỉ chừa một vùng sáng — dùng cho một khoảnh khắc "bấm vào đây" duy nhất, không có gì khác cạnh tranh sự chú ý. |
| 🔍 **Zoom / Magnify** | Phóng to tại chỗ một chi tiết quá nhỏ để đọc (nút, toggle, chữ nhỏ). Luôn là hình chữ nhật bo góc, không phải kính lúp tròn. |
| ▒ **Privacy Blur** | Làm mờ dữ liệu nhạy cảm (email, tên, API key, đơn hàng...) trước khi ảnh được công khai. Chỉ dùng để che thông tin — không dùng thay cho highlight/spotlight để nhấn mạnh. Cần đặt đè khít lên đúng vùng cần che, đặt lệch ra ngoài sẽ không che được gì. |
| ↗ **Arrow** | Trỏ từ một nhãn/chú thích đến đúng phần tử nó mô tả. Dùng biến thể gấp khúc (elbow) khi hai điểm neo thẳng hàng theo trục; dùng đường cong mặc định khi không thẳng hàng. Cách thả: bấm nút rồi **kéo-thả** trực tiếp trên canvas từ điểm bắt đầu đến điểm kết thúc (không phải bấm một chỗ). |
| 🏷️ **Label** *(ngoài bộ kit gốc)* | Nhãn nhỏ tự do — cũng là loại phần tử dùng cho **Context stamp** (mục 10). |

Ngoài ra còn **Screenshot Presentation** (nền đệm + khung bo góc quanh toàn bộ ảnh) — đây **không**
phải nút thả trong cột trái, mà là công tắc **Image frame** trên topbar (mục 10).

## 7. Cắt ảnh (Crop)

Nút **⛶ Crop** trên topbar (tab Snap) mở một khung cắt trên chính ảnh nền — khác với vùng chọn lúc
chụp (mục 3), đây là cắt lại một ảnh **đã** có trên canvas, kể cả sau khi đã thêm chú thích.

- Khung mở sẵn ở giữa ảnh, rộng 80% ảnh gốc — kéo 4 góc để chỉnh kích thước.
- `Enter` để áp dụng, `Esc` để huỷ.
- Áp dụng xong: phần pixel ngoài khung **mất vĩnh viễn** (không tự lưu ảnh gốc vào Library trước —
  xem mục 5), và mọi chú thích đang có được **dời vị trí** theo khung mới chứ không bị xoá — kể
  cả phần tử rơi ra ngoài khung mới cũng được giữ nguyên, không tự xoá hay kéo về.
- Vì không làm mất chú thích nào, bấm Apply không hỏi xác nhận lại — khác với đóng tab hay
  Replace base image (mục 5).

## 8. Layers (lớp)

- Danh sách bên trái, theo đúng thứ tự vẽ: **Base image** (ảnh gốc) luôn ở đầu — chọn được nhưng
  không xoá được, vì nó quyết định khung ảnh khi xuất.
- Bấm một dòng để chọn phần tử đó trên canvas; bấm ✕ ở cuối dòng để xoá.
- Chưa hỗ trợ kéo-thả đổi thứ tự lớp nói chung. Riêng các lớp **ảnh dán thêm** (mục 9) có nút đẩy
  lên/xuống trong bảng Properties, nhưng luôn nằm dưới mọi chú thích — để một ảnh dán sau không
  đè mất text-box/highlight đã đặt trước đó.
- Muốn chụp lại từ đầu: dùng **Replace base image…** trong Properties của Base image, thay vì xoá.

## 9. Dán ảnh vào canvas

`Ctrl+V` dán bất kỳ ảnh nào đang có trong clipboard (ảnh từ Snipping Tool, ảnh khách gửi, ảnh copy
từ ứng dụng khác...):

- Nếu canvas đang trống → ảnh dán vào trở thành **ảnh nền** (base image).
- Nếu canvas đã có ảnh → mỗi lần dán thêm **một lớp ảnh mới**, kéo/resize được (khoá tỉ lệ), xếp
  chồng lên nhau — dùng để ghép ảnh trước/sau, hoặc đặt một chi tiết phóng to bên cạnh ảnh toàn
  trang. Dán không bao giờ thay thế ảnh cũ.

## 10. Hai công tắc trên topbar

| Công tắc | Ý nghĩa |
|---|---|
| **Image frame** | Bật/tắt nền đệm + khung bo góc quanh toàn bộ ảnh xuất ra (component Screenshot Presentation). Bật sẵn theo mặc định. |
| **Context stamp** | Bật/tắt nhãn nhỏ đóng dấu trình duyệt / hệ điều hành / URL / thời gian lên góc ảnh. |

## 11. Xuất / sao chép kết quả

Chỉ xuất **PNG**. Trước khi xuất, ẩn hết khung/panel của editor rồi chụp lại đúng tab đó (không
phải vẽ lại canvas) — vì hiệu ứng kính mờ (`backdrop-filter`) của Zoom/Magnify, Privacy Blur...
không thể "vẽ lại" qua canvas thông thường.

| Nút | Kết quả | Phím tắt |
|---|---|---|
| ⧉ Copy image | Chép ảnh đã chú thích vào clipboard, dán thẳng vào ticket/chat | `Ctrl+C` (khi đang focus vào canvas) |
| ⬇ Export PNG | Tải file `snap-<domain>-<ngày>-<giờ>.png` về máy | — |

**Lưu ý quan trọng**: `captureVisibleTab` chỉ chụp được đúng phần đang thực sự hiển thị trong cửa
sổ trình duyệt. Nếu ảnh gốc lớn hơn cửa sổ hiện tại, phần xuất ra sẽ bị cắt bớt (có toast báo) —
phóng to cửa sổ rồi xuất lại.

## 12. Thư viện (Library)

Tab **Library** là nơi duy nhất lưu lại ảnh qua thời gian — không phải server, chỉ là bộ nhớ của
trình duyệt (`chrome.storage`) trên đúng máy này.

- **⤓ Save to library** (trong toolbar tab Snap) là nút **duy nhất** ghi vào đây. Đóng tab, Replace
  base image, và Crop đều **không** tự lưu — xem mục 5.
- Mỗi thẻ trong lưới Library là một ảnh đã lưu, đầy đủ chú thích. Bấm vào thẻ để mở lại thành một
  tab mới trong Snap.
- **Retention** (cột trái) chọn số ngày ảnh đã lưu tự xoá: 7 / 14 (mặc định) / 30 ngày, hoặc
  "Never" (không khuyến khích — ảnh trong ticket thường có dữ liệu khách hàng).
- **Clear library…** xoá sạch toàn bộ ảnh đã lưu ngay lập tức.
- Không có link chia sẻ, không đồng bộ giữa các máy — ảnh chỉ tồn tại trong trình duyệt đã lưu nó.

## 13. Tab Components (xem & tạo component riêng)

Tab **Components** cho xem trước toàn bộ component của kit trên nền sáng, nền tối, hoặc chính ảnh
bạn vừa chụp (có thể bật/tắt nội dung giao diện giả lập bên dưới lớp kính mờ để thấy đúng hiệu ứng
blur/glass) — không phải nơi để chú thích ảnh thật.

**Accent colour** ở cột trái đổi tông màu chủ đạo cho toàn bộ ứng dụng — cả 5 màu có sẵn lẫn màu tự
chọn — áp dụng ngay cho mọi component đang có trên canvas lẫn giao diện editor, không chỉ component
mới thêm.

**+ New component** không phải viết CSS tự do ngay trong ứng dụng: quy trình là

1. Copy sẵn một prompt có trong tab (đã soạn sẵn cấu trúc yêu cầu).
2. Dán prompt đó vào một phiên Claude riêng, mô tả component bạn muốn.
3. Nhận lại một file `.md` theo đúng khuôn mẫu, rồi tải (upload) file đó vào tab Components.
4. Sau khi tạo, có thể sửa tay phần CSS thô trong ô textarea — có cảnh báo (lint) ngay khi gõ nếu
   dùng màu/khoảng cách/bo góc/cỡ chữ viết cứng (hardcode) thay vì token thiết kế.

Component tạo ra xuất hiện trong cột trái ở mục **Yours**, thả lên ảnh như mọi công cụ khác.
**⧉ Copy CSS** chép CSS của toàn bộ component tự tạo cùng lúc, để dán tay vào `tokens-extras.css`
nếu muốn đưa nó vào bộ kit thật. Tính năng này dành cho người quen CSS và bộ token thiết kế (vd. kỹ sư
hỗ trợ kỹ thuật), không phải để người dùng thông thường viết CSS ngẫu hứng.

## 14. Tab KB (dựng bài hướng dẫn)

Cần cài thêm trước khi dùng — xem mục 2.2. Tab này không phải nơi chú thích thủ công như Snap: bạn
mô tả yêu cầu, một agent tự lái trình duyệt, chụp, chú thích và viết bài giúp.

- **+ New job**: điền **Instruction** (yêu cầu bài viết cần làm gì), đính kèm **Reference doc**
  `.md` (tuỳ chọn — nút **📋 Copy prompt for dev team** chép sẵn một prompt để nhờ Claude Code của
  team dev viết file này giúp), và thêm **Session tabs** — các tab trình duyệt agent được phép
  dùng (mở sẵn tab cần thiết, đã đăng nhập đúng, rồi bấm refresh để chọn). Agent chỉ thao tác được
  trong các tab này, không tự mở tab mới.
- Bấm **▶ Start job**: màn hình chuyển sang xem job đang chạy — canvas của agent bên trái, bài
  viết đang được dựng bên phải, log tiến trình bên dưới. **⏸ Pause** / **■ Stop** trên topbar tạm
  dừng hoặc huỷ job bất cứ lúc nào.
- Job xong sẽ tự mở bài viết: khung soạn markdown + xem trước song song. Có thể **💬 Comment** —
  bấm vào một điểm trên ảnh hoặc bôi đen một đoạn chữ để ghim góp ý, xem **🕐 History** các bản đã
  lưu, hoặc gõ yêu cầu vào ô prompt cuối trang và bấm **▶ Send** để nhờ agent tự sửa lại bài (dùng
  đúng ảnh đã chụp sẵn, không mở lại trình duyệt) — **⟲ New session** nếu muốn bắt đầu lại cuộc
  trò chuyện sửa bài từ đầu. **Save** khi hài lòng, **🗑 Delete** để xoá hẳn bài.
- Bài viết nằm trong thư mục `kb/` của repo, bị gitignore — không đi theo git, mỗi máy có bộ bài
  riêng, và không tự xoá theo thời gian như Library.

## 15. Tổng hợp phím tắt

| Phím | Tác dụng |
|---|---|
| `Alt+Shift+S` | Chụp toàn bộ tab đang hiển thị |
| `Alt+Shift+R` | Chụp một vùng chọn |
| `Ctrl+Shift+9` | Chụp một cửa sổ/màn hình khác (phím tắt toàn cục) |
| `Ctrl/Cmd+V` | Dán ảnh từ clipboard (ảnh nền hoặc lớp ảnh mới) |
| `Ctrl/Cmd+C` | Copy ảnh đã chú thích vào clipboard |
| `Backspace` / `Delete` | Xoá phần tử đang chọn |
| `Enter` | Áp dụng khung Crop đang mở |
| `Esc` | Huỷ khi đang kéo-thả mũi tên, đang chọn vùng chụp, hoặc đang mở khung Crop |

## 16. Giới hạn hiện tại (bản V1)

- **Library chỉ lưu local.** Không có server, không link chia sẻ, không đồng bộ giữa các máy —
  xem mục 12.
- Không có tính năng gắn liên kết ticket/Slack.
- Không sửa chữ trực tiếp trên canvas — phải sửa trong bảng Properties bên phải.
- Tab Components chưa có quy trình duyệt/PR — component tự tạo chỉ tồn tại trong trình duyệt của
  bạn cho tới khi ai đó dán CSS thủ công vào `tokens-extras.css`.
- Tab KB cần cài đặt riêng (mục 2.2) và bài viết không đi theo git — mỗi máy dựng bài của riêng nó.

Chi tiết đầy đủ và lý do kỹ thuật của từng giới hạn: xem mục "What this is NOT (yet)" trong
[README.md](README.md).
