<!-- ─────────────────────────────────────────────────────────────────────────
PLACEMENT PLAYBOOK — trí nhớ về cách đặt annotation cho đúng.

Cả Claude lẫn người dùng cùng sửa file này. Claude ĐỌC TRƯỚC khi đặt bất kỳ
step / textbox / highlight / arrow / zoom nào, và APPEND một LEARNING mới mỗi
lần người dùng sửa lại một chỗ đặt sai.

Người dùng sửa chủ yếu bằng cách GHIM COMMENT lên đúng điểm sai trên ảnh trong
KB Studio. Đọc bằng `snap_comments` (pin đã quy đổi sẵn ra pixel của ảnh gốc,
kèm step và element gần nhất), đóng bằng `snap_comment_resolve` — quy trình đầy
đủ ở SKILL.md, phần "Vòng review".

File này dạy CÁCH ĐẶT, không dạy CHỌN component nào — việc chọn component đã có
`snap_kit`: `use_when` + `gotchas` từ `src/kit-catalog.js`, CỘNG với `anchor`,
danh sách prop thật và giá trị mặc định đọc thẳng ra từ `src/components/*.js`
(`snap-bridge/kit-introspect.js`). Gọi `snap_kit` để chọn component VÀ để tra tên
prop; đọc file này để đặt. Đừng chép lẫn nhau, và đừng đoán tên prop.

Định dạng:
  - PRINCIPLES: luật ổn định, quan trọng nhất trước.
  - LEARNINGS: bài học có ngày tháng, cụ thể (đổi gì · vì sao), mới nhất ở trên cùng.
    Mỗi mục có một id dạng `L-<ngày>-<chữ>` — `snap_learn` tự đóng dấu ngày và
    id, ĐỪNG tự gõ vào nội dung. Khi một learning lặp lại đủ nhiều thì nâng thành
    PRINCIPLE.

Log này chỉ append-only về LỊCH SỬ, không phải về THẨM QUYỀN. Không ai xoá hay
sửa chữ của một mục cũ; nhưng khi bạn CHỨNG MINH được một learning là sai, gọi
`snap_learn` với `supersedes: "<id cũ>"`: mục đó giữ nguyên văn bản trong file, bị
đóng nhãn SUPERSEDED, và thôi được nạp vào prompt của các job sau.
────────────────────────────────────────────────────────────────────────── -->

# KB annotation — placement playbook

## Hệ toạ độ ở repo này (đọc kỹ — khác các công cụ slide-deck)

**Canvas KHÔNG cố định.** `.stage` là `display:inline-block` co theo `#baseImg`
(`src/editor.css:94`), nên vùng vẽ **chính là kích thước tự nhiên của ảnh chụp**:
`capture.img.w × capture.img.h`. Không có con số 1128×660 hay bất kỳ canvas cố định nào.

- **Biết kích thước thật ở đâu**: `snap_capture_tab` trả về `Captured <W>x<H> from …`.
  Dùng đúng W/H đó làm biên. Trên máy dev hiện tại thường là **1920×889** (viewport Chrome
  maximized), nhưng **không được hard-code** — máy khác, zoom khác, số khác.
- **Gốc toạ độ** (0,0) ở góc trên-trái ảnh. Không có padding ẩn.
- Không truyền `props.x/y` → element rơi vào **tâm ảnh** (`centerXY()`, `src/surface.js`).
- **Cần đọc một toạ độ khỏi ảnh** → `snap_view({ path, grid: true })`, đừng ước lượng
  (PRINCIPLE #7 — ảnh bạn nhìn thấy đã bị thu nhỏ).

### Ngữ nghĩa x/y khác nhau theo từng type — bẫy thật, đã kiểm chứng trong code

> ⚠️ **Bảng này từng SAI về `step` và `label`** (ghi là "góc trên-trái" trong khi cả hai
> render qua `translate(-50%,-50%)`). Sửa ngày 2026-09-01. Nếu bạn nhớ luật cũ, quên đi.
> **Đừng tin trí nhớ ở mục này — gọi `snap_kit`**, nó đọc `anchor` + danh sách prop thật
> ra thẳng từ `style()`/`defaults()` của từng component (`snap-bridge/kit-introspect.js`),
> nên không thể lệch khỏi code như bảng dưới đã từng.

| Type | `x/y` nghĩa là gì | Kích thước mặc định (ở khung 1280px) |
|---|---|---|
| `textbox` | **góc trên-trái** (chiều cao tự co theo nội dung) | `w: 280` |
| `zoom` | **TÂM** (`src/components/zoom.js` `style()`) | `198 × 198`, `zoom: 2.2` |
| `step` | **TÂM** (`src/components/step.js:46`) | `90 × 28` |
| `label` | **TÂM** (`src/components/label.js`) | tự co theo chữ: rộng `7.2k × số ký tự + 28k`, cao `28k` |
| `highlight` / `spotlight` | góc trên-trái | `180 × 48` |
| `blur` | góc trên-trái | `180 × 32` |
| `arrow` | dùng `x1/y1/x2/y2`, **không** có `x/y` | — |

Nhầm `zoom` (tâm) với `textbox` (góc) làm lệch đúng **99px** — đủ để trông "gần đúng mà sai".
Nhầm `step` (tâm) thành góc thì pill 90px nằm lệch **45px sang trái**, tức đè lên đúng cái
control nó đang đánh số.

### Kích thước annotation TỰ CO theo bề rộng ảnh (từ 2026-09-01)

Kit được vẽ cho khung ~**1280px**. Trên ảnh rộng hơn, mọi phần "chrome" của component
(chiều cao pill, cỡ chữ, độ dày viền, ô mosaic của blur, độ đậm mũi tên) được nhân với

```
uiScale = clamp(round(img.w / 1280 * 4) / 4, 1, 3)
```

— `src/surface.js` `uiScale()`. Ảnh 2560 (viewport HiDPI, rất phổ biến) → **×2**.

Ba hệ quả bạn phải biết:

- **Không tự nhân toạ độ.** Chỉ chrome co giãn; `x/y/w/h` vẫn là pixel thật của ảnh.
- **Kích thước mặc định trong bảng trên là ở 1280.** Một `step` không truyền `w/h` trên ảnh
  2560 thật ra là `180 × 56`. Tính biên theo số đã nhân, không theo số trong bảng.
- **`snap_add` với `at` đã tự lo phần này** — nó đọc `uiScale` từ ảnh đang mở. Đây là một lý
  do nữa để dùng `at` thay vì gõ tay.

---

## PRINCIPLES (đọc trước khi đặt)

### −1. Đừng đoán toạ độ khi có element thật để neo. (hard rule)

`snap_add({ type, at: { selector, tabId } })` đọc hộp thật của element rồi tự lo **cả ba**
thứ hay sai: ngữ nghĩa `x/y` của type đó, `uiScale` của ảnh, và chọn phía còn chỗ trống.
`at` giờ neo được **cả `arrow`** (`side`, hoặc `toSelector` để nối hai element) — trước đây
arrow là type duy nhất buộc phải gõ tay, và đó là lý do mọi bài KB cũ đều có mũi tên dài
600px cắt ngang vùng trống rồi đâm vào giữa cái khung nó trỏ tới.

`at` nhận thêm: `side` (`left`/`right`/`top`/`bottom` — bỏ trống thì tự chọn phía **còn đủ
chỗ**, không phải mặc định cứng), `pad`, `gap`, `fromId` (riêng arrow: id của callout mà mũi
tên xuất phát), `length` (riêng arrow — **gần như không bao giờ cần**, xem #1b).

Chỉ gõ `props.x/y` khi thật sự không có element nào để neo (callout đặt giữa vùng trắng).
Khi đó: đọc bảng ngữ nghĩa `x/y` ở trên, và **đọc toạ độ bằng `snap_view({path, grid:true})`
chứ không ước lượng** — xem #7.

### 0. Không gì được tràn khỏi khung ảnh. (hard rule)

Callout, step marker, arrow, zoom — **không phần nào** được vượt quá mép ảnh. Một
component bị cắt là **lỗi hỏng**, không phải "chấp nhận được".

Tính biên từ kích thước thật của ảnh (W×H từ `snap_capture_tab`) trừ đi kích thước của
chính component — **đã nhân `uiScale`** (mục "Kích thước annotation tự co" ở trên; ảnh 2560
thì `k = 2`):

- `textbox` (w `280k`, cao ~`150k`): giữ `x ≤ W - 300k`, `y ≤ H - 220k`.
- `zoom` (`198k × 198k`, x/y là **tâm**): giữ `99k ≤ x ≤ W - 99k` và `99k ≤ y ≤ H - 99k`.
- `step` / `label` (`90k × 28k`, x/y là **tâm**): giữ `45k ≤ x ≤ W - 45k`, `14k ≤ y ≤ H - 14k`.

**Bạn không phải tự tính nữa — nhưng vẫn phải đọc.** `snap_add`, `snap_job` và
`snap_render_job` đều chạy kiểm tra hình học và trả về khối `WARNING:` khi có element tràn
mép, đè lên vùng nó trỏ tới, mũi tên đâm vào trong khung, hoặc prop không tồn tại. Cảnh báo
**không chặn** — nó vẫn render. Bỏ qua cảnh báo là tự chọn ship ảnh hỏng.

**Và vẫn phải kiểm chứng bằng mắt**: sau `snap_export`/`snap_render_job`, `Read` (hoặc
`snap_view`) file PNG vừa xuất. Máy bắt được "tràn mép" và "đè nhau"; nó **không** bắt được
"mũi tên trỏ vào chỗ trống", "che mất chữ quan trọng", "PII còn lộ". Không "chắc là ổn".

> **LEARNING 2026-08-28** — bài KB đầu tiên
> (`kb/multibuy-percentage-discount-per-combo-vs-highest-tier.md`): Step 4 đặt gần đáy khung
> và **bị cắt mất một nửa**, vì phần "Tier settings" nó trỏ tới nằm ngoài viewport chụp.
> Nguyên nhân kép: (a) toạ độ y quá sát đáy, (b) target thật ra không có trong ảnh — xem
> nguyên tắc #2.

### 1. Callout không bao giờ đè lên target của nó.

Đặt `textbox`/`step` **lệch sang bên**, chừa khoảng trống giữa nó và vùng nó nói tới, rồi
nối bằng `arrow`. Nếu callout nằm chồng lên chính thứ người đọc cần nhìn thì cả hai đều hỏng.

> **LEARNING 2026-08-28** — cùng bài KB đó: Step 5 đặt đè lên link "more products" trong
> vùng preview, che mất chính nội dung đang mô tả.

### 1b. Độ dài mũi tên là **hệ quả**, không phải con số bạn chọn. (từ 2026-09-02)

Mũi tên trong bài KB luôn nối **hai thứ đã có trên ảnh**: callout của bước đó
(`label`/`step`/`textbox`) và target nó trỏ tới. Khoảng cách giữa hai thứ đó là một **số đo**,
không phải thứ để gõ tay. Gõ tay thì sai cả hai chiều — và đã sai đúng như vậy trong **cùng
một bài đã ship**:

- **Dài quá** — đuôi gõ "quá mép pill một chút" thật ra nằm **trong** pill (pill của `label`
  tự co theo chữ; ở ảnh 2560 nó rộng gấp 2–3 lần cảm giác bằng mắt), nên thân mũi tên vẽ
  xuyên qua chính chữ của label. Hoặc callout bị đỗ ở một chỗ cố định trong máng trống và mũi
  tên phải kéo **540px = 21% bề ngang ảnh** mới với tới.
- **Ngắn quá** — đuôi gõ sát ngay cạnh pill: cả mũi tên chỉ 160px trong khi riêng **đầu mũi đã
  42px** (ảnh 2560, `scale` mặc định `1.5 × k` = 3). Nhìn ra một tam giác mập có cái cuống,
  không ra mũi tên.

**Cách làm đúng — đặt cặp callout + arrow trên cùng một target, để `at` tự tính:**

```
snap_add({ type: "label", at: { selector, tabId }, props: { text: "Bước 3: …" } })
snap_add({ type: "arrow", at: { selector, tabId } })     // đuôi tự bám vào label vừa đặt
```

Thứ tự nào cũng được: đặt `arrow` trước thì `label`/`step`/`textbox` sau đó rơi đúng vào **đuôi
mũi tên**. Kết quả cố định: đầu mũi dừng `14k` trước mép target, đuôi cách pill `14k`, thân dài
`4.5 × chiều dài đầu mũi` — và **mọi mũi tên trong bài dài bằng nhau**, dù chữ trong label dài
ngắn thế nào. (Vì vậy callout neo bằng `at` giờ đứng cách mép target đúng một mũi tên tối
thiểu, chứ không sát mép như trước.)

- Nhiều callout cùng một phía → chỉ đích danh bằng `at.fromId` (id `snap_add` trả về khi thêm
  callout đó).
- **Dạng đường cũng tự chọn theo luật của kit** (`kit-catalog.js` mục `arrow`): hai đầu thẳng
  hàng → đường thẳng; hai đầu **lệch trục** → `shape: "curved"`. Mũi tên chéo thẳng là dạng
  duy nhất luôn sai, nên `at` không bao giờ sinh ra nó.
- Không có callout nào phía sau → độ dài rơi về mặc định `150k`, **cắt theo chỗ trống thật**
  của phía đó nên không bao giờ tràn mép.
- `at.length` chỉ dùng khi không có callout để bám **và** độ dài tự tính vẫn sai. Gõ `length`
  chính là cách sinh ra hai lỗi ở trên.

Kiểm tra hình học (`snap_add` / `snap_job` / `snap_render_job`) giờ bắt cả bốn dạng: đuôi nằm
**trong** callout (báo kèm số `x1` đúng), thân **vẽ xuyên qua** callout, mũi tên ngắn hơn
`4.5 ×` đầu mũi, và mũi tên vượt **18% bề ngang ảnh** (dấu hiệu callout bị đỗ sai chỗ — sửa
callout, đừng sửa mũi tên).

### 2. Xác minh target TỒN TẠI, HIỆN RÕ, ĐÚNG STATE trong ẢNH NÀY — trước khi đặt. (hard rule)

Dấu hiệu ảnh chụp sai (sửa **bước chụp**, không phải dời annotation):

- mũi tên kết thúc ở khoảng trống;
- copy bảo "bấm nút X" nhưng nút đang mờ/disabled;
- danh sách rỗng trong khi bài viết mô tả các dòng dữ liệu;
- nội dung cần trỏ tới nằm **dưới fold** — ngoài viewport chụp.

Cách sửa đúng: cuộn tới đúng chỗ (`snap_frame_scroll` / `mcp__chrome__scroll`) **rồi mới**
`snap_capture_tab`, hoặc click để mở đúng state trước. **Không** dời callout lên một target
không có trong ảnh.

**Cách chắc chắn nhất**: dùng `snap_frame_find` để lấy `rect` thật của element trước khi
chụp. Nếu `rect.y` âm hoặc lớn hơn chiều cao viewport → nó **không có trong khung**, phải
cuộn trước.

### 3. Đừng đổ lỗi cho engine khi annotation trông sai.

Gần như luôn là **placement** hoặc **capture**, không phải engine hỏng. Trước khi kết luận
"component này không vá được", kiểm tra lại: đúng toạ độ chưa, đúng ngữ nghĩa x/y của type đó
chưa, target có thật trong ảnh không.

**Và trước khi đoán tên prop lần thứ hai: gọi `snap_kit`.** Nó liệt kê chính xác prop nào
component đọc. Hai learning trong file này là "engine limitation" tự kết luận sau 1–2 lần
đoán sai tên prop — cả hai đều sai, xem phần ĐÍNH CHÍNH. Prop không tồn tại giờ được báo
thẳng trong kết quả `snap_add`/`snap_job`, không còn im lặng nữa.

> **LEARNING 2026-08-28** — mất 6 vòng thử sai vì kết luận "Polaris radio có quirk không vá
> được", trong khi lỗi thật là **selector tự sinh không duy nhất** nên click trúng radio khác.
> Chi tiết: `KB-BRIDGE.md`, phần iframe cross-origin. Bài học tổng quát: khi một thao tác
> "chạy không lỗi nhưng không có tác dụng", **nghi ngờ mình đang tác động nhầm đối tượng trước**.

### 4. Bước 1 luôn định vị trong menu.

Câu hỏi đầu tiên của người đọc là *"bấm đâu để tới màn hình này?"*. Ảnh đầu tiên của mỗi bài
KB phải trỏ vào mục menu/nav mở ra màn hình đó — `highlight` lên mục menu + `step` + `arrow`.
Giữ cue nav ở **bước 1 thôi**, trừ khi bước sau đổi màn hình.

### 5. Mỗi bài ≥1 `zoom` lên chi tiết quyết định.

Mỗi bài KB nên có ít nhất một `zoom` phóng đúng một chi tiết nhỏ mà bài viết nói về (một
badge trạng thái, một ô số, một giá trị dropdown, một toggle) — thay vì tả bằng lời "cái ô
nhỏ ở góc phải".

Đừng chồng `zoom` và `highlight` lên cùng một điểm nhỏ; chọn một.

**Neo `zoom` bằng `at`, đừng gõ tâm bằng tay.** `zoom` phóng vùng `w / magnification` pixel
quanh tâm nó. Gõ tâm lệch vài chục pixel là rơi vào **khoảng trắng giữa hai field**, và kết
quả không phải "hơi lệch" mà là **một ô kính trắng trơn** đè lên screenshot — trông như
render hỏng. `snap_add({ type:"zoom", at:{selector} })` canh tâm vào đúng element và chọn
kích thước đủ để có ngữ cảnh xung quanh.

Hai con số cần nhớ nếu vẫn phải gõ tay:

- **Độ phóng mặc định là `2.2×`** (trước đây là `1.1×` — dưới ngưỡng nhìn ra được, nó chỉ tạo
  một bản sao lệch pha của chính vùng bên dưới, đúng thứ trông "hỏng và xấu" trong các bài cũ).
- **Vùng nguồn = `w / 2.2`.** Muốn phóng một control rộng ~`X` pixel thì đặt `w ≈ 2.2 × X`.
  `w` quá nhỏ → crop quá bé → kính trắng. `snap_job`/`snap_add` cảnh báo khi crop xuống dưới
  ~72 CSS px, nhưng nó **không** biết vùng đó có nội dung hay không — cái đó chỉ nhìn ảnh mới
  thấy.

### 6. Che PII trước khi xuất. (hard rule cho bài công khai)

Ảnh chụp từ portal thật **luôn** chứa thứ không nên lên KB công khai: tên tài khoản, email,
tên cửa hàng, tên khách, số đơn thật. `blur` lên chúng **trước** `snap_export` — sau khi
export là quá muộn, file đã nằm trên đĩa.

Chủ động đề xuất blur; đừng chờ được nhắc. Nếu không chắc một vùng có phải PII không → hỏi
người dùng, đừng tự quyết là "chắc không sao".

**Dùng `job.globalEls`, không blur từng bước.** PII của một app luôn nằm **cùng một chỗ trên
mọi ảnh** — chip tài khoản góc phải trên, tên cửa hàng ở header. Đặt các `blur` đó **một lần**
vào `globalEls` ở cấp job.

**Target là một element thật, chọn được selector → dùng `at`, đừng gõ tay.** `blur` nhận `at`
y hệt `highlight`/`spotlight` (`kit-geometry.js` đọc box thật của element + `pad`), nên chip tài
khoản/tên cửa hàng nên được neo bằng `snap_add({ type:"blur", at:{selector, tabId, pad:8} })`
rồi chép `props` nó tính ra vào `globalEls` — box đo được, không phải box đoán. Vì đây là
`globalEls`, đoán sai là sai **trên mọi ảnh cùng lúc**, nên đây là chỗ ít nên gõ tay nhất trong
cả bài, không phải chỗ ít quan trọng nhất. Chỉ gõ tay `x/y/w/h` khi target không có selector ổn
định (che theo một vùng ảnh chứ không theo một element) — khi đó bắt buộc `snap_view({grid:true})`
để đọc số (PRINCIPLE #7), và kiểm tra ngay ảnh **đầu tiên** được render chứ đừng đợi tới ảnh cuối:

```json
{ "title": "...", "slug": "...",
  "globalEls": [ { "type": "blur", "props": { "x": 2486, "y": 14, "w": 64, "h": 28 } } ],
  "steps": [ ... ] }
```

`snap_render_job` vẽ chúng **dưới** els của từng bước, trên **mọi** ảnh. KB Studio cũng hiện
chúng trong bản xem sống (khoá, không kéo được — chúng thuộc về job chứ không thuộc bước nào).
Đây là cách duy nhất chống lại kiểu lỗi "blur ở bước 1 rồi quên 7 bước còn lại".

Ngoại lệ: PII chỉ xuất hiện ở một ảnh (tên khách trong một đơn cụ thể) thì vẫn để trong
`steps[].els` của ảnh đó.

> **LEARNING 2026-08-28** — `kb/img/01-multibuy-offer-settings-annotated.png` lộ tên tài khoản
> thật `huynq-vl` ở thanh nav Shopify admin, không blur. `KB-BRIDGE.md` mục 5.4 đã cảnh báo
> trước rằng blur PII "chưa bắt buộc" trong lần dựng đầu — và đúng là nó đã lọt.
>
> **LEARNING 2026-09-01** — cùng một lỗi, quy mô lớn hơn: `multibuy-mix-match-combo` blur
> `huynq-vl` ở bước 1 và **để lộ ở 10 bước còn lại**. Không phải quên nguyên tắc — mà là nguyên
> tắc đòi lặp lại một thao tác thủ công 11 lần. Đó là lý do `globalEls` tồn tại.
>
> **LEARNING 2026-09-03** (`L-2026-09-03-a`) — lần thứ ba, dạng khác: `volume-discount-translations`
> **có** đặt `globalEls` đúng cách, box vẫn **sai** — gõ tay x/y/w/h chỉ trúng mép phải của chip,
> initials vẫn lộ rõ trên cả 5 ảnh. Không phải quên luật, mà là đoán toạ độ cho đúng một element
> thật thay vì đo nó — xem đoạn `at` ngay trên, đây là lý do quy tắc đó được thêm vào.

> **RÀ SOÁT 2026-09-11** (audit tay, không qua `snap_learn` — phiên review không có snap-bridge) —
> lỗi này **vẫn đang sống**, ở dạng thứ tư: một `globalEls` blur duy nhất, toạ độ đo đúng cho MỘT
> ảnh, vẫn lộ PII ở ảnh khác **trong cùng bài**, dù W×H hai ảnh giống hệt nhau (không phải lỗi
> `uiScale`). Bằng chứng, hai bài độc lập:
> - `volume-discount-translations`: `globalEls` blur `{x:1798,y:10,w:112,h:38}` trên canvas
>   1920×945. Ở `img/01-nav-translations-annotated.png` nó che đúng đoạn tên cửa hàng ở giữa chip
>   (nhưng avatar "HB" và tag "dev" hai bên vẫn lộ — che một phần, không phải toàn bộ chip). Ở
>   `img/03-translation-mode-annotated.png` **cùng box đó** không che gì cả — chip hiện đủ chữ
>   `huynq-vl` không mờ.
> - `variant-swatches-volume`: `globalEls` blur `{x:1798,y:6,w:112,h:40}` trên canvas 1920×945.
>   Che đúng ở `img/01-menu-annotated.png` (thấy rõ ô pixelated) nhưng **không che gì** ở
>   `img/04-color-annotated.png` — avatar tím và `huynq-vl` hiện đầy đủ.
>
> Nguyên nhân nhiều khả năng nhất: chip tài khoản/tên cửa hàng trên topbar Shopify admin **không
> đứng yên một toạ độ cố định qua mọi bước** — nó co giãn theo độ dài tên cửa hàng đang hiển thị,
> theo việc có badge "dev"/thông báo hay không, theo trạng thái sidebar. Hai ảnh cùng 1920×945
> vẫn có thể có chip lệch nhau vài chục đến hơn trăm pixel nếu chụp khác thời điểm/khác trang.
> Một `globalEls` box đo trên đúng MỘT ảnh (thường là ảnh đầu) là một phép ngoại suy cho N ảnh
> còn lại, không phải một phép đo.
>
> **Luật rút ra**: đo `globalEls` xong, đừng chỉ nhìn ảnh đầu để xác nhận (mục 6 "kiểm tra bằng
> mắt" của SKILL.md) — **nhìn ít nhất một ảnh ở giữa bài và ảnh cuối bài** trước khi coi PII đã
> chặn xong. Nếu chip lệch giữa các bước, `globalEls` một box không đủ: hoặc nới rộng box đó (đo
> theo ảnh có chip **rộng nhất** trong bài, không phải ảnh đầu), hoặc bỏ `globalEls` cho riêng
> (các) bước lệch và thêm một `blur` khác trong `steps[].els` của đúng bước đó với toạ độ đo lại.

### 7. Đọc toạ độ bằng lưới, đừng ước lượng bằng mắt. (hard rule)

Ảnh trả về cho bạn qua `snap_view`/`Read` **luôn bị thu nhỏ** cho vừa ngân sách ảnh (2560px
→ ~2000px hoặc nhỏ hơn). Một toạ độ ước lượng trên bản thu nhỏ sai đúng bằng hệ số đó —
thường 20–35%, đủ để "gần đúng mà sai" và không đủ để nhìn ra ngay.

Khi cần **đọc** một con số x/y khỏi ảnh (không phải chỉ đánh giá "trông ổn không"):

```
snap_view({ path: "img/03-foo.png", grid: true })
```

Lưới có nhãn, vẽ theo **pixel thật của ảnh**. Đọc số trên nhãn. Không nhân, không quy đổi.

Thứ tự ưu tiên vẫn là: `at` (không cần toạ độ) → `grid:true` (đọc số) → ước lượng (đừng).

### 8. Callout đánh số bước: `step`, không phải `label`. (hard rule — rà soát 2026-09-11 lộ ra là bị vi phạm ở CẢ BỐN bài đã ship)

File này tự nhận "dạy CÁCH ĐẶT, không dạy CHỌN component" (chọn là việc của `snap_kit`/
`kit-catalog.js`) — nhưng việc chọn sai đúng một chỗ đang lặp lại ở mọi bài, nên luật này đứng ở
đây để không ai phải đoán lại lần thứ năm.

**`label` không phải component đánh số bước.** Đọc `editorial-glass/SKILL.md` và comment đầu
`src/components/label.js`: `label` là "NOT a kit component" — Snap Studio tự thêm vì kit gốc
không có ô tag tự do nào, dùng cho context-stamp và những chú thích ngắn KHÔNG cần thứ tự
("1"/"2"/"3" đánh số cột bảng, tên một field). Component **đánh số bước thật sự** trong kit là
`step` (`step-marker`, luôn `"Step {n}"`, pill accent + viền trắng — mục "ĐÍNH CHÍNH" ở dưới) hoặc
`textbox` với `mode:"step"` khi cần thêm mô tả dài.

**Bằng chứng — rà soát toàn bộ 4 bài đã ship (21 ảnh annotated, `kb/*.md` + `kb/*/job.json`)**:

| Bài | Số callout bước dùng `label` (kiểu `"Step N: <câu>"`) | Số callout dùng `step` | Số dùng `textbox` |
|---|---|---|---|
| `mega-menu-translations` | 5/5 | 0 | 0 |
| `qikify-upsell-translations` | 4/4 | 0 | 0 |
| `volume-discount-translations` | 8/8 | 0 | 0 |
| `variant-swatches-volume` | 4/5 (1 bước dùng `step` đúng) | 1 | 0 |

`textbox` — cấu kiện có `title`+`body`+badge, phù hợp nhất cho một callout cần nói nhiều hơn một
cụm từ — **chưa từng được dùng, ở bất kỳ bài nào.** `spotlight` cũng vậy (xem "BỘ COMPONENT" dưới).

Xem trực tiếp để thấy khác biệt: `kb/img/01-menus-list-annotated.png` (label, pill đen đặc, chữ
"Step 1: Open Translations") so với `kb/variant-swatches-volume/img/01-menu-annotated.png` (step
thật, pill accent + viền trắng, chỉ "Step 1" — không kèm câu). Cùng một việc "định vị mục menu ở
bước 1" (PRINCIPLE #4), nhưng chỉ ảnh thứ hai còn giữ được cái vòng ring mà `kit-catalog.js` gọi
là *load-bearing* cho step-marker.

**Vì sao đây không chỉ là gu thẩm mỹ:**

1. **Trùng chữ.** Bài KB nào cũng có prose kèm ảnh (khung bài ở `SKILL.md`: mỗi bước là một `##
   N. heading` + `body` viết đầy đủ "In your Shopify admin, go to..."). Gõ lại đúng câu đó vào
   một `label` trên ảnh là lặp lại thông tin đã có, đúng thứ mà `text-box`'s `use_when` trong
   `kit-catalog.js` dành riêng cho trường hợp **ngược lại** — "ảnh phải tự đứng một mình, không
   có bài viết kèm theo" (community post, video frame). Bài `/kb` luôn có bài viết kèm theo, nên
   theo đúng use_when, callout trên ảnh chỉ cần đánh số + tối đa vài chữ định hướng, không phải
   một câu hoàn chỉnh.
2. **Mất tín hiệu thị giác.** `step` luôn tô `--color-primary-500` (accent) — cùng màu với mọi
   `highlight`/`arrow` khác trên ảnh, nên mắt nối được "cụm accent này thuộc về nhau: khung, mũi
   tên, số bước". `label` mặc định tô đen (`--color-neutral-900`, có prop `accent` để đổi nhưng
   không bài nào đang set `true`) — một pill đen giữa các pill accent đọc như "hai hệ thống đánh
   dấu khác nhau" dù ý đồ là cùng một hệ.
3. **Không phải lỗi engine đã sửa rồi bị quên.** Learning `L-2026-08-30-a` (bị `supersedes`, xem
   ĐÍNH CHÍNH ngay dưới) từng kết luận sai "step không đặt được số nên dùng label cho mọi bước".
   Kết luận đó đã bị bác từ 2026-08-30, nhưng thực tế `label` vẫn là lựa chọn mặc định ở **cả 3
   bài dựng sau ngày đó** — tức là việc sửa engine (`customNumber`, `stepLabel()`) không tự động
   sửa được thói quen đặt, vì thói quen không đọc lại phần ĐÍNH CHÍNH này.

**Quy tắc**: đặt callout đánh số bước → mặc định `step` (compact khi ảnh chật, theo đúng
`kit-catalog.js`'s "compact is the fallback for tight space, not the default"). Chỉ viết câu dài
vào callout khi ảnh thật sự phải tự đứng một mình (không có `body` nào đi kèm nó trong bài) — lúc
đó dùng `textbox` (`mode:"step"`, `title` ngắn, `customNumber` nếu cần chỉnh số) chứ không phải
kéo dài `label`. Dùng `label` (không `accent`) đúng vai của nó: tag không cần thứ tự — số cột/hàng
bảng, một field name ngắn — không phải "Step N: …".

Chi tiết đủ mọi prop thật của `step`/`textbox`/`label` và khi nào chọn cái nào (kể cả `spotlight`,
`zoom`, `highlight`, `arrow`, `blur` còn lại) — xem "BỘ COMPONENT" ngay dưới ĐÍNH CHÍNH.

## ĐÍNH CHÍNH — đọc trước phần LEARNINGS

Hai learning dưới đây đã được kiểm chứng lại và xác định là **sai**. Chúng đã bị
`supersedes` đóng nhãn nên không còn được nạp vào prompt của job nữa, nhưng bản ghi
gốc vẫn nằm nguyên bên dưới để thấy được nó sai thế nào. Phần này là chỗ giải
thích đầy đủ — **luật thì lấy ở đây**.

### ✗ SAI — "`step` không set được số, dùng `label` cho mọi bước" (2026-08-30, `L-2026-08-30-a`)

Đúng một nửa, kết luận sai. `step` thật sự **không có** prop `n`/`number` — số của nó là
**vị trí trong `capture.els`** (`src/surface.js` `stepNumber()`), nên một ảnh có đúng một
step marker thì luôn ra "Step 1". Đó là thiết kế, không phải bug.

**Nhưng cách đúng không phải là bỏ `step`.** Dùng `textbox`:

```json
{ "type": "textbox", "props": { "x": 300, "y": 240, "mode": "step",
    "customNumber": 4, "title": "Tier Settings", "body": "..." } }
```

`customNumber` ghi đè số tự động và render đúng "Step 4" (`src/components/textbox.js`,
`surface.js` `stepLabel()`). Cần đúng một pill số, không kèm chữ? `hideBody: true` +
`hideTitle: false`.

**Cái giá của learning sai này**: `multibuy-mix-match-combo` dùng `label` cho cả 11 bước.
`label` là pill **neutral-900 đặc**, không có vòng ring trắng và màu accent của step marker
— mà `kit-catalog.js` gọi vòng ring đó là *"load-bearing, not decorative"*: nó chính là thứ
giữ cho marker đọc được trên nền screenshot bất kỳ. Bài viết mất nó ở mọi bước.

### ✗ SAI — "`textbox` chỉ nhận `body`, header hard-code là 'Tip'" (2026-08-30, `L-2026-08-30-d`)

Sai hoàn toàn. `textbox` có hai mode và **cả hai** đều đặt được tiêu đề:

- `mode: "step"` → `title` (chuỗi tự do) + badge "Step N" (`customNumber` để chỉ định số).
- `mode: "note"` → `label` (chuỗi tự do). `"Tip"` chỉ là **giá trị mặc định** của `label`,
  truyền `label: "Lưu ý"` là đổi được.

Cả hai còn có: `hideTitle`, `hideBody`, `compactBadge`, `border`, `borderWidth`, `fontSize`,
`w`. Learning cũ suy ra từ 1–2 lần đoán tên prop rồi kết luận là "engine limitation" —
đúng cái lỗi mà PRINCIPLE #3 cảnh báo.

**Cách tra cho chắc, thay vì đoán**: `snap_kit` giờ trả về **danh sách prop thật** của từng
component (đọc thẳng từ `defaults()` của nó) kèm `anchor` và giá trị mặc định. Prop nào không
có trong danh sách đó thì `snap_add`/`snap_job` sẽ cảnh báo là bị bỏ qua — không còn im lặng.

---

## BỘ COMPONENT — dùng khi nào, prop thật nào, và bài đã ship đang sai ở đâu

Phần này **tổng hợp lại** từ ba nguồn — `src/kit-catalog.js` (`use_when`/`gotchas` của kit gốc),
`src/components/*.js` (prop thật + default, đọc trực tiếp từ `defaults()`/`propsHtml()`, không
đoán), và một lượt rà soát bằng mắt toàn bộ 4 bài đã ship (`mega-menu-translations`,
`qikify-upsell-translations`, `variant-swatches-volume`, `volume-discount-translations` — 21 ảnh
annotated) — để một bài mới không phải lục ba chỗ mới ráp lại được bức tranh đầy đủ cho một
component. PRINCIPLES ở trên dạy **toạ độ đặt ở đâu**; phần này dạy **chọn cái gì** và **set prop
gì** — hai trục khác nhau, đọc cả hai trước khi thêm annotation đầu tiên.

### Bảng chọn nhanh theo tình huống

| Tình huống trên ảnh | Component đúng | Đừng dùng |
|---|---|---|
| Đánh số một bước trong chuỗi thao tác, bài có prose kèm theo | `step` (compact nếu chật chỗ) | `label`, `textbox` |
| Đánh số một bước, nhưng ảnh phải tự đứng một mình (không prose kèm — hiếm trong `/kb`) | `textbox` (`mode:"step"`) | `label` |
| Một câu tip/cảnh báo cần neo **tại đúng chỗ trên ảnh**, không chỉ nằm trong blockquote dưới ảnh | `textbox` (`mode:"note"`) | nhét vào `label`, hoặc bỏ qua và chỉ viết trong `notes[]` |
| Tag ngắn không theo thứ tự — số cột/hàng bảng, tên field, nhãn tự do | `label` | `step` |
| Khoanh một vùng để mắt nhìn thấy ranh giới, có `arrow`/`step` đi kèm | `highlight` (`shaded:false`, mặc định) | `highlight` (`shaded:true`), `spotlight` |
| Khoanh một vùng phải tự mang hết sức nặng chú ý, không gì khác trỏ vào nó | `highlight` (`shaded:true`) hoặc `spotlight` | `highlight` viền mỏng đơn độc |
| Một khoảnh khắc "chỉ nhìn đúng một chỗ này" kiểu onboarding, mọi thứ khác phải mờ đi | `spotlight` | `highlight` dù có shaded |
| Một chi tiết nhỏ (toggle, badge, giá trị) cần phóng to để đọc được | `zoom` (neo bằng `at`) | tả bằng lời, hoặc `highlight` khoanh mỗi chi tiết nhỏ |
| Nối một callout tới đúng target của nó | `arrow` (neo `at` + `fromId`, không gõ độ dài — PRINCIPLE #1b) | gõ tay `x1/y1/x2/y2` khi có element để neo |
| Che PII lặp lại ở cùng vị trí trên mọi ảnh | `blur` trong `job.globalEls`, neo `at` | `blur` gõ tay lặp lại từng bước |
| Che PII chỉ xuất hiện đúng một ảnh | `blur` trong `steps[].els` của ảnh đó | thêm vào `globalEls` rồi hy vọng nó không lệch ở ảnh khác |

### `step` — pill đánh số, load-bearing, mặc định cho MỌI callout tuần tự

- Prop thật (`src/components/step.js`): `x/y` (**tâm**), `compact` (bool, vòng tròn chỉ số trần —
  "fallback cho chỗ chật, không phải mặc định"), `video` (32px thay vì 28px, cho export video),
  `w/h` (tự co theo `uiScale`, kéo góc để resize tự do). **Không có prop đặt số** — số luôn là vị
  trí của nó trong `capture.els` (`stepNumber()`); cần số khác thứ tự thật thì đây không phải
  component đúng, đổi sang `textbox` + `customNumber` (xem ĐÍNH CHÍNH ở trên).
- Luôn tô `--color-primary-500` + viền trắng 2px — **không có** biến thể on-dark vì viền trắng đã
  đủ tương phản trên mọi nền (`kit-catalog.js`: "documented no-op, not a missing case").
- Đặt bằng `at` để nó tự chọn TÂM đúng ngữ nghĩa (bảng x/y ở đầu file) và tự chọn phía còn trống.

### `textbox` — thẻ card, dùng khi cần NÓI nhiều hơn một cụm từ

- Prop thật (`src/components/textbox.js` `defaults()`): `x/y` (**góc trên-trái**, không phải
  tâm — khác `step`/`label`/`zoom`), `w` (280 mặc định, tự co chiều rộng, chiều cao luôn theo nội
  dung), `mode` (`"step"` | `"note"`, loại trừ nhau), `title`, `body`, `label` (chỉ dùng ở mode
  note), `hideTitle`, `hideBody`, `compactBadge`, `customNumber`, `border`, `borderWidth`,
  `fontSize`.
- `mode:"step"` → badge "Step N" (dùng `step`-marker con bên trong) + `title` ngắn + `body` mô tả
  dài hơn một `label` chịu được — dùng khi một callout cần giải thích **tại sao**, không chỉ **ở
  đâu**. `mode:"note"` → nhãn tự do (mặc định "Tip", đổi được qua `label`) + `body` — đây là
  component đúng cho một cảnh báo/tip cần neo **tại đúng chỗ trên ảnh**, khác với `notes[]` (luôn
  render thành blockquote **dưới** ảnh, tách khỏi vị trí thị giác của thứ nó nói tới).
- **Chưa từng được dùng trong 4 bài đã ship.** Ví dụ cụ thể lẽ ra hợp: bước 2 của
  `qikify-upsell-translations` (`kb/img/02-translations-page-annotated.png`) có một
  `notes[].kind:"Important"` dài về việc dropdown bị khoá cần plan trả phí — nội dung đó chỉ nằm
  trong blockquote dưới ảnh, trong khi một `textbox` (`mode:"note"`) neo cạnh chính cái dropdown
  đang mờ sẽ nối được ý "vì sao nó xám" với **đúng pixel** đang xám, không chỉ với đoạn văn cách
  đó vài trăm px.
- Border (khi bật) luôn màu neutral — primary-500 dành riêng cho badge/connector, viền accent ở
  đây sẽ làm cái card trông quan trọng ngang với thứ nó đang giải thích, lật ngược thứ bậc.

### `label` — tag tự do, KHÔNG phải số thứ tự bước

- Prop thật (`src/components/label.js`): `x/y` (**tâm**), `text`, `accent` (bool — đổi từ đen
  neutral-900 sang accent primary-500; **không bài nào đang bật**, dù nó tồn tại đúng để một
  `label` hoà được với các pill accent khác trên ảnh khi thật sự cần dùng label cạnh chúng).
- Không phải component trong kit gốc (`catalogId: null`) — Snap Studio tự thêm cho context-stamp
  và tag ngắn không cần thứ tự. Xem PRINCIPLE #8 ở trên cho lý do đây không phải chỗ đặt "Step N".
- Dùng đúng: số cột/hàng bảng tham chiếu (như `variant-swatches-volume` bước 2 — "1"/"2"/"3"/"4"
  trên đầu 4 cột, không phải bước tuần tự), tên field ngắn, một cụm 2-3 chữ không cần đánh số.

### `highlight` — khung/vùng tô, mặc định viền, không fill

- Prop thật (`src/components/highlight.js`): `x/y` (**góc trên-trái**), `w/h`, `shape` (`"rect"` |
  `"ellipse"` — ellipse là biến thể riêng của Snap Studio, kit gốc chỉ có rect bo góc), `shaded`
  (bool), `borderWidth` (mặc định `2.5 × uiScale`).
- **Viền là mặc định đúng** khi có `arrow`/`step` đi kèm — cả 4 bài đã ship đều theo đúng luật này
  (không bài nào bật `shaded` hay dùng `shape:"ellipse"`, đúng như `kit-catalog.js` khuyến nghị
  cho trường hợp có annotation khác cùng trỏ vào). Chỉ bật `shaded` khi box phải tự mang hết chú ý,
  không gì khác trỏ vào nó — và không bao giờ bật trên vùng có chữ nhỏ (fill 10% vẫn đo được là
  giảm tương phản).

### `spotlight` — làm mờ cả khung, chừa đúng một lỗ

- Prop thật (`src/components/spotlight.js`): `x/y/w/h` (**góc trên-trái**, giống `highlight`),
  `dark` (bool, làm đậm thêm lớp phủ khi ảnh nền vốn đã tối).
- **Chưa từng được dùng trong 4 bài đã ship** — nhưng điều đó hợp lý hơn trường hợp `textbox`:
  cả 4 bài đều là hướng dẫn cấu hình trong Shopify admin (nhiều control cùng lúc trên màn hình),
  không phải một khoảnh khắc onboarding "chỉ bấm đúng một nút này". Giữ nguyên tắc của
  `kit-catalog.js`: dùng khi một bước **không được phép** có gì khác kéo mắt đi — ví dụ bước đầu
  tiên của một luồng cài đặt lần đầu, nơi màn hình có sẵn nhiều nút nhưng bài chỉ muốn người đọc
  thấy đúng một cái. Đừng dùng như "highlight mạnh hơn" cho mọi box quan trọng — đó là việc của
  `shaded:true`, không phải lý do tồn tại của `spotlight`.

### `zoom` — phóng to tại chỗ, mặc định 2.2×, nhưng thực tế mọi bài đều phóng thấp hơn

- Prop thật (`src/components/zoom.js`): `x/y` (**tâm**, đồng thời là tâm vùng nguồn — đổi x/y để
  "dời" bong bóng ra chỗ khác sẽ lấy mẫu từ chỗ trống, xem `L-2026-09-01-c`), `w/h` (khung hiển
  thị), `zoom` (hệ số phóng, mặc định `2.2`), `shape` (`"rect"` | `"circle"`), `radius`, `border`,
  `borderWidth`, `dark` (thêm viền trắng khi nền tối).
- **Cả 4 bài đã ship đều phóng dưới mức mặc định khuyến nghị**: `qikify-upsell-translations` bước
  3 dùng `zoom:1.8`; `volume-discount-translations` bước 2 dùng `zoom:1.6`;
  `variant-swatches-volume` bước 4 dùng `zoom:1.7`. Cả ba đều nằm trong vùng chính comment của
  `zoom.js` cảnh báo là "below the threshold where a magnifier reads as a magnifier" (ngưỡng an
  toàn ghi trong code là ~1.5, mặc định khuyến nghị 2.2). Nhìn lại từng ảnh (`snap_view`) thì cả
  ba **vẫn render rõ, không vỡ** — nên đây không phải lỗi cần sửa ngay, nhưng là một độ lệch có hệ
  thống giữa "mặc định đã sửa vì lý do cụ thể" và "cái mọi người thực sự gõ". Đừng coi việc ba bài
  trước dùng 1.6–1.8 mà không vỡ là bằng chứng an toàn để bài sau tiếp tục hạ thấp — mỗi lần đổi
  `zoom` vẫn phải `snap_view` lại (PRINCIPLE trong LEARNING `L-2026-09-02-c`: đổi hệ số phóng
  không phải phép toán an toàn, một tổ hợp x/y/w/h/zoom xấu có thể ra ảnh vỡ dù ba số kia không đổi).
- Không chồng `zoom` lên đúng chỗ một `highlight` đã khoanh (PRINCIPLE #5) — chọn một.

### `arrow` — nối callout với target, hình dạng là hệ quả của vị trí hai đầu

- Prop thật (`src/components/arrow.js`): `x1/y1/x2/y2` (không có `x/y`), `shape` (`"straight"` |
  `"curved"` | `"elbow"`), `elbow` (`"h-then-v"` | `"v-then-h"`, chỉ áp dụng khi `shape:"elbow"`),
  `curvature`/`curveShift` (chỉ áp dụng khi `shape:"curved"`), `scale` (mặc định `1.5 × uiScale`),
  `secondary` (bool, bỏ viền trắng — chỉ dùng cho nhấn mạnh thấp hơn, không phải mặc định),
  `origin` (chấm tròn ở đuôi), `hideHead` (chỉ vẽ thân, không đầu mũi).
- **Cả 4 bài đã ship đều dùng `shape:"straight"`** — không phải lỗi: mọi cặp callout+target trong
  các bài đó đã thẳng hàng trục ngang hoặc dọc (đúng cách `at` tự đặt callout lệch sang một phía
  cố định của target), nên `straight` giữa hai điểm thẳng hàng chính là lựa chọn đúng theo
  `kit-catalog.js` — dùng `curved`/`elbow` chỉ khi hai đầu **thật sự** lệch trục.
- `scale:2.25` xuất hiện lặp lại ở cả 3 bài có dùng nó tường minh — một con số hợp lý khi ảnh gốc
  đủ lớn (2560px) và cần mũi tên rõ giữa nhiều chi tiết nhỏ, nhưng vẫn nên xuất phát từ nhìn ảnh
  thật (PRINCIPLE #7) chứ không sao chép mù từ bài trước — `uiScale` của ảnh mới có thể khác.

### `blur` — pixelate thật, không phải backdrop-filter

- Prop thật (`src/components/blur.js`): `x/y/w/h` (**góc trên-trái**) — không có prop biến thể
  nào khác (`bindProps` rỗng), đúng như kit gốc "no variants on this component".
  Kích thước mosaic cell (12px nguồn, tự nhân `uiScale`) là hằng số, không chỉnh được từ UI.
- Che **cả hàng dữ liệu**, không chỉ riêng phần chữ — box hẹp hơn text vẫn lộ hình dạng chữ qua vài
  block mosaic (đúng nguyên văn ghi chú trong `propsHtml()` của chính component).
- Xem mục "RÀ SOÁT 2026-09-11" ở PRINCIPLE #6 phía trên: đây là component **có tỉ lệ lỗi cao nhất**
  trong 4 bài đã ship — không phải vì component sai, mà vì `globalEls` một box tĩnh không theo kịp
  một chip tài khoản đổi vị trí/độ rộng giữa các bước.

---

## LEARNINGS (mới nhất trước)

*(Skill `/kb` append vào đây mỗi khi người dùng sửa lại một chỗ đặt sai. Ghi: ngày · đặt sai
thế nào · vì sao sai · luật rút ra. Nguồn chính của những lần sửa đó là comment ghim trên ảnh:
mỗi comment về **cách đặt** mà bạn `snap_comment_resolve` phải để lại một dòng ở đây — resolve mà
không ghi thì bài học chết theo cái pin. Ngày và id do `snap_learn` đóng dấu — đừng
gõ ngày vào nội dung. Chứng minh được một mục cũ sai thì truyền `supersedes` kèm id của nó.)*

- **2026-09-02** `L-2026-09-02-f` — `textbox` (mode:"step", compactBadge) has a real rendering-position quirk, distinct from the general hand-typed-coordinate bug (L-2026-09-02-e): its visible box lands at roughly x_real≈0.78·x_typed, y_real≈y_typed−12, confirmed via calibrated renders through both snap_add and job.json/snap_render_job — it's the component, not a session artifact. Worse: `at.fromId`'s companion-arrow logic uses a DIFFERENT, wrong fallback box ("560x300 at (typed x,y)") to compute the tail, so an arrow built with at+fromId to a far-away textbox lands nowhere near the real card — a near-zero-length stub, not a connector. checkGeometry warnings are equally unreliable, checking that same wrong box. Fix: don't trust fromId for a textbox-anchored arrow at any real distance. Instead calibrate the textbox's true rendered position empirically (render, measure with snap_view+grid, iterate), then hand-write the arrow's x1/y1/x2/y2 from the measured real boxes — arrow coords render at face value. Trust snap_view over the WARNING here.

- **2026-09-02** `L-2026-09-02-e` — Hand-typed props.x/y/w/h to snap_add (no `at`) rendered at a uniform ~0.78x scale-from-origin in one session — confirmed by placing a highlight at a known UI card's real bounds (718,148,367,100) and seeing it land at ~(560,115). Overflow/geometry WARNINGs still matched the RAW typed values and gave false confidence — they check typed props, not rendered pixels. `at`-based placement (selector+tabId+frameId) was unaffected and reproduced byte-identical results to a separate prior session for the same selector. Rule: no WARNING firing does not mean a hand-typed box rendered where you think. Prefer `at` whenever any real DOM element exists to anchor to (even plain text/headings, not just controls) — this is exactly how a PII blur silently missed its target. With no element to anchor to, calibrate a tiny (10x10) marker against a known landmark before trusting hand-typed coordinates for anything PII-sensitive.

- **2026-09-02** `L-2026-09-02-d` — "component mũi tên khi gắn vào ảnh trong KB lúc thì dài quá, lúc thì ngắn quá". Nguyên nhân không phải người đặt cẩu thả mà là hai hằng số **không biết đến nhau**: `geometryFor` đặt `label`/`step` cách mép target `46k` tính tới **TÂM** pill, còn `arrowGeometry` luôn kéo đuôi ra `150k` — nên trên ảnh 2560, một label 23 ký tự (rộng 387px) trùm qua cả target lẫn toàn bộ thân mũi tên, còn mũi tên thì lúc xuyên qua chữ của label, lúc hụt lại giữa không trung. `label` lại **vô hình** với mọi kiểm tra hình học vì nó không có `w/h` trong props (`elBox` trả 0×0), nên không có cảnh báo nào. Sửa: (a) `elSize()` tính đúng pill của label từ chính CSS của `label.js` — font mono nên mỗi ký tự đúng `0.6em`, đối chiếu với renderer thật ở k = 1/1.5/2/2.5 khớp tới từng pixel; (b) callout neo bằng `at` giờ đo từ **mép gần** của pill và chừa sẵn chỗ cho một mũi tên tối thiểu; (c) độ dài mũi tên suy ra từ callout nó xuất phát (`chooseCompanion`), hoặc từ chỗ trống thật của phía đó, không còn hằng số; (d) callout đặt sau cũng tự rơi vào đuôi mũi tên đã có, nên thứ tự đặt không còn quan trọng; (e) `checkGeometry` thêm 4 cảnh báo về mũi tên. Luật rút ra: **độ dài mũi tên là hệ quả của vị trí hai đầu — nếu đang gõ một con số độ dài thì đang làm sai** (xem PRINCIPLE #1b).

- **2026-09-02** `L-2026-09-02-c` — dich-ngon-ngu-app-volume-discount step 3: tried to fix a known "zoom at 1.1x looks broken/glitchy" case by bumping `zoom` from 1.1 to 1.8 while keeping the same w/h (280x76), expecting only a tighter, more-magnified in-place crop. Result was worse, not better: the rendered zoom bubble showed a garbled fragment (a stray letter and a couple of stray lines) instead of the intended "Item text" field — reverted to 1.1 and it rendered correctly again. Rule: changing a `zoom` component's `zoom` factor is not a safe math-only edit even with x/y/w/h untouched — it changes exactly which source pixels get sampled, and a bad combination can visibly corrupt the crop. Never change a zoom's magnification without immediately re-rendering and snap_view-ing the result before moving on; if it looks worse, revert rather than trying to "fix the fix" by further guessing, especially when the magnification wasn't what was actually asked for.

- **2026-09-02** `L-2026-09-02-b` — dich-ngon-ngu-app-volume-discount steps 2-3: arrow tails hand-typed at what looked like "just past the label pill's right edge" (e.g. x1=607 for a label centered at x=492) actually landed WELL INSIDE the pill and rendered as a line drawn straight through the label's own text ("...choose a langu[arrow]age", "...default con[arrow]tent"). Cause: `label`'s pill auto-sizes to its text at 2x uiScale (2560-wide capture), so a 26-33 char string is ~500-700px wide even though it "looks" narrower when eyeballing the source screenshot mentally. Rule: never anchor an arrow tail near a `label`/`step`/`textbox` using a guessed offset from its center x/y — auto-sized components can be 2-3x wider than intuition suggests at 2x uiScale. Either (a) shorten the label text (cheapest, also shrinks the pill per the 2026-09-02 principle already in this file), or (b) give the tail a large, deliberately generous clearance (100px+) past the estimated edge, then render+snap_view and pull it back in if the gap looks too big — pulling back in is a safe correction, starting inside the pill is not.

- **2026-09-02** `L-2026-09-02-a` — User feedback "components too big, don't let them overlap, prefer empty space" on an article using `label` pills for step callouts: `label` has no fontSize prop, so the only lever to shrink its rendered pill is shortening the text itself (e.g. "Step 2: Open the Quantity Break offer" → "Step 2: Open the offer" visibly shrank the pill). Also reduced `highlight` borderWidth 2.5→1.75 and `arrow` scale 1.5→1 for a lighter look. Separately found a real overlap bug: a label placed at real-pixel center (407,195) on a 2560-wide storefront capture overlapped the product photo (which started at x=565) — the fix was checking the actual photo/content bounding box before centering a callout in what looks like "empty" space to the left of it, not just checking it doesn't hit the sidebar/table like an admin screenshot. When shortening an existing label's text, double-check any arrow that pointed at a fixed absolute coordinate near the old pill's edge — it must be re-derived from the new (smaller) pill's actual edge, not reused, or it starts mid-air short of the pill or overshoots into the wrong target.

- **2026-09-01** `L-2026-09-01-d` — In one session, every hand-typed x/y/w/h (no `at`) rendered at a uniform ~0.78× the typed value with ~zero offset, confirmed via two far-apart calibration round-trips (snap_add → export → snap_view grid). Not uiScale (that only scales chrome, not position) and too big for canvas-padding — likely stale shared-editor state from a prior session's image size. Fix: before placing real annotations, calibrate empirically (place a test element, render, measure with grid, derive factor k), then type every coordinate as desired_pixel / k. The overflow WARNING checks raw typed values against frame size and will false-positive on a correctly-compensated element — trust snap_view, not the warning text, in this state. Also: current label/highlight render sizes for a given string are much larger than older reference images in this repo (~450px for a 30-char label on a 2560-wide capture) — when translating/recreating annotations on an existing article, budget much more open space per label than the original layout used.

- **2026-09-01** `L-2026-09-01-c` — `zoom`'s props.x/y is BOTH the source-sample center AND the display position (true in-place magnifier), not two independent things. Overriding x/y to "relocate" the bubble away from its `at`-anchored element instead re-samples FROM the new (often empty) spot, producing a blank white zoom bubble. There's a `connector` prop for true relocation (schema unexplored). Safe default: leave zoom in-place; if that would cover important adjacent text, drop the zoom for that image rather than pass a naive x/y override.

- **2026-09-01** `L-2026-09-01-b` — `label` component's x/y acts as a RIGHT-edge anchor (text extends LEFTWARD from x), not left-edge/center. A small x for a long label ran it off canvas-left entirely (hard rule #0). Rule: for `label`, set x ≈ desired right edge, budget ~9-10px/char leftward for the string, and keep x large enough that x-minus-textwidth stays ≥0 (and clear of any sidebar).

- **2026-09-01** `L-2026-09-01-a` — Nested cross-origin iframe (Shopify admin > embedded app, capture 2560x1249): a snap_frame_find `rect` copied straight into snap_add's manual x/y is WRONG for a NESTED iframe (boxes landed hundreds of px off) — always use `at:{selector,tabId,frameId}` there instead. For a TOP-LEVEL (non-nested) page, e.g. the plain storefront product page, frame rect DOES equal canvas coords 1:1 — the transform only exists once you're inside a nested iframe.

- **2026-08-30** `L-2026-08-30-e` — job.json steps[].els items must nest all annotation fields under a "props" key ({type, props:{x,y,...}}), matching snap_add's own {type, props} shape. Writing them flat ({type, x, y, text, ...} as siblings, no props wrapper) is silently accepted by snap_job/snap_render_job with no error, but the renderer then ignores every field and falls back to each component's hardcoded demo defaults (blur/highlight/zoom disappear entirely, textbox/label/step render the canned "Step 1 / Open Settings / Click the icon..." sample copy instead of your text) — a full 3-image article rendered wrong silently until the PNGs were actually viewed. Always nest under props when hand-building job.json (snap_job read of a working job confirms the shape); re-render and snap_view immediately after the first write to catch this class of silent-default bug before iterating on placement.

- **2026-08-30** `L-2026-08-30-d` — ⚠️ **SUPERSEDED — xem ĐÍNH CHÍNH ở trên. `title` (mode:"step") và `label` (mode:"note") ĐỀU hoạt động.** — textbox component (mode:"note") ignores any prop named text/note/title/heading for its content — only `body` is respected for the message; the header title is hard-coded to "Tip" and cannot be overridden by any prop name tried (title, heading). Same class of bug as the step-marker's fixed "Step 1" numeral (2026-08-30 learning). WORKAROUND: just write the note's message via props.body and accept the English "Tip" header even in a non-English article — don't burn more than 1-2 prop-name guesses on the header text next time.

- **2026-08-30** `L-2026-08-30-c` — how-to-search-wikipedia steps 1-2 (Wikipedia main page, capture 2560x1249, Vector 2022 skin): job.json existed despite the revise-job prompt's metadata claiming "flat single-file, no job.json" — per the 2026-08-30 learning, always try snap_job first regardless of what the task description says. The highlight box around the search input was too wide on the left (x=705,w=320), spilling into the "WikipediA" logo/wordmark to its left instead of framing just the input; the right edge (705+320=1025) happened to be correct. Fix: x=790,y=10,w=245,h=34 tightly frames just the search `<input>` (magnifier icon + placeholder/typed text), excluding both the logo on the left and the separate "Search" button on the right. Rule: when a highlight "looks close but shifted", check whether it's actually bracketing a wider region than the real target (input-only vs input+button, or target+neighboring element) rather than assuming a uniform x/y translation — the right edge here was already right, only the left edge needed to move ~85px.

- **2026-08-30** `L-2026-08-30-b` — ⚠️ **Nguyên nhân gốc đã tìm ra 2026-09-01: ảnh trả về bị THU NHỎ trước khi tới bạn. Không phải "cẩn thận hơn" — dùng `snap_view({grid:true})`, xem PRINCIPLE #7.** — Manual pixel-coordinate estimates from viewing a PNG are unreliable, even carefully: fixing "highlight lệch" I first extended a search-box highlight's left edge from x=700 to x=605 to stop it looking short, which actually pushed it INTO the neighboring "WikipediA" wordmark — invisible until the re-render was viewed. Separately, a title's real bbox was misjudged by ~170px. Rule: treat any manually-estimated x/y as a draft; after rendering, specifically check the highlight border against the target's real edges for overshoot into a NEIGHBORING element, not just undershoot, and expect 2-3 render/view iterations, not one. Also: a task prompt claiming "no job.json" can be stale — try `snap_job` first regardless; it returned real, useful ground-truth coordinates here.

- **2026-08-30** `L-2026-08-30-a` — ⚠️ **SUPERSEDED — xem ĐÍNH CHÍNH ở trên. Kết luận "dùng `label` cho mọi bước" là SAI.** — "step" (step-marker) component's number is NOT settable via any snap_add/job.json prop in this build. Tried n, number, index, step, label, text, variant:"compact" — always renders "Step 1", both via direct snap_add on a flat capture and via job.json steps[].n through snap_render_job. Confirmed engine limitation (12+ isolated tests, ruled out caching/stale-editor first per principle #3) — don't burn more than 2-3 prop-name guesses on this again. WORKAROUND: use type `label` instead, props:{x,y,text:"Step N"} — renders the literal text correctly, top-left positioned like a step badge. Its default pill is solid black, not `step`'s purple/white-ring style, so use `label` for EVERY step in an article (not just the broken ones) to keep a consistent look. Also: for a full-bleed capture, a highlight box's edge nearest a canvas/page corner (e.g. near a logo) can render clipped-looking even when props look right and the box's far edge is correctly placed — the canvas padding/scaling affects edges unevenly near corners; if only the near edge looks wrong, nudge it outward ~60-80px, not ~10-20px.

- **2026-08-29** `L-2026-08-29-a` — Revise job (no browser) on a flat single-file article (how-to-search-wikipedia, no job.json): the exported "-annotated.png" referenced in the markdown was NOT pixel-identical in resolution to its own unannotated base file on disk (annotated 2026x1008 vs true base img/01-homepage.png at 2560x1249 — same page, non-uniform aspect difference, cause unclear, not a clean scale factor). Do not reverse-engineer element coordinates by reading pixels off the (smaller) annotated export and reusing them on the base — open the actual unannotated base PNG, re-estimate target coordinates directly on IT, then render+snap_view to verify/iterate before overwriting the annotated file. Worked first try here for a well-defined target (search input + button) by eyeballing fractions of the base image width/height and refining with one test render.

- **2026-08-28** `L-2026-08-28-b` — Lần dựng KB đầu tiên lộ ba lỗi cùng lúc: Step 4 tràn mép (→ #0), Step 5 đè
  nội dung (→ #1), lộ tên tài khoản thật (→ #6). Cả ba đều là lỗi *đặt* và *chụp*, không phải
  lỗi chọn component — đó là lý do playbook này tách khỏi `snap_kit`.

- **2026-08-28** `L-2026-08-28-a` — (lần chạy thử playbook này) Ba lỗi cũ **đều không tái diễn**. Ba điều học
  thêm được:

  1. **Toạ độ từ `snap_frame_find` KHÔNG dùng thẳng được cho `snap_add`.** `rect` trả về nằm
     trong hệ toạ độ **của frame đó**, còn `snap_capture_tab` chụp **cả tab** (gồm sidebar +
     topbar của Shopify admin). Phải cộng offset của iframe trên trang cha. Đo được lần này:
     `canvas = frame + (240, 121)` — 240 = bề rộng sidebar, 121 = topbar + page header. **Con số
     này của riêng layout Shopify admin ở cỡ cửa sổ đó**, không phải hằng số: đo lại bằng cách
     đối chiếu một element có `rect` với vị trí của nó trên ảnh đã chụp. Lúc ghi chú này vẫn
     phải làm tay; ánh xạ tự động đã build sau đó — xem `at` của `snap_add` và `cmdFrameRect()`
     trong `src/bridge-worker.js`.
  2. **`zoom` che mất ngữ cảnh xung quanh nó.** Nó phóng to *tại chỗ*, nên vùng 198×198 dưới nó
     bị thay thế. Lần này zoom lên cặp radio Discount type đã che luôn tiêu đề "Tier settings"
     ngay trên. Chấp nhận được vì phần phóng to chính là nội dung chính, nhưng **hãy chọn tâm
     zoom sao cho phần bị che là chỗ ít quan trọng nhất** — đừng đặt giữa hai thứ đều cần thấy.
  3. **Kích thước canvas đổi giữa các phiên**: lần trước 1920×**889**, lần này 1920×**945** (cùng
     máy, khác chiều cao cửa sổ). Xác nhận luật "đọc W×H từ response `snap_capture_tab`, không
     hard-code" là bắt buộc chứ không phải cẩn thận thừa.