---
name: kb-review
description: Chấm lại một bài KB đã có sẵn (đã render PNG) theo PLACEMENT_PLAYBOOK.md, độc lập với việc chạy job dựng bài — không cần đang capture, không cần Chrome mở. Dùng khi người dùng muốn "review lại bài KB", "chấm bài đã viết", "audit bài cũ", hoặc bất cứ khi nào một bài dựng qua đường `/kb` tương tác (không đi qua "+ New job", nên chưa từng có ai/gì soi lại) cần một lượt kiểm tra độc lập. Spawn một agent mới hoàn toàn — không có ký ức về việc đã dựng bài — chỉ nhìn ảnh + đọc job.json, file finding qua snap_findings, không tự sửa gì.
---

# /kb-review — chấm lại một bài KB đã có

Đây **không phải** một phần của job "+ New job" (job đó đã tự có review stage riêng, chạy tự
động — xem `SKILL.md` của `/kb` mục *Job "author"*). `/kb-review` là đường gọi tay, dùng cho:

- Bài dựng qua `/kb` tương tác (gõ thẳng trong phiên Claude Code) — đường này **không có ai soi
  lại**, "nhìn bằng mắt" (mục 6 của `/kb`) là lớp kiểm duy nhất nó từng qua.
- Bài cũ muốn audit lại sau khi playbook có thêm luật mới, hoặc sau khi app đổi UI.
- Bất cứ lúc nào người dùng muốn một lượt "mắt lạ" mà không phải chạy lại toàn bộ job.

## Vì sao phải spawn agent MỚI, không tự review lấy

Agent vừa đặt một annotation **nhớ mình định vẽ gì**, và đọc lại ảnh xuất như thể ý định đó đã
lên hình — đúng lý do `REVIEW_ROLE` trong `kb-job.js` mở đầu bằng: *"YOU DID NOT TAKE THESE
SCREENSHOTS AND YOU DID NOT WRITE THIS PROSE... You only have the pixels."* Muốn có "mắt lạ"
thật thì phải dùng một phiên **không có ngữ cảnh** của việc dựng bài — tức spawn qua công cụ
Agent (`subagent_type: "general-purpose"`, **không phải** `"fork"` — fork thừa kế nguyên context
của bạn, mất đúng thứ cần).

**Ghi nhớ bài học của repo nguồn (Guide Studio) — luôn nhắc agent review:** *"Reviewers are
strict but imperfect. Before acting, verify their big claims yourself."* Đã có lần cả một hội
đồng agent review đều báo sai cùng một lỗi — verdict của agent
review không phải chân lý tuyệt đối, người dùng vẫn nên liếc lại finding "blocker" trước khi tin
hẳn.

## Cần có trước

- **`snap-bridge` đang chạy** và extension đã nối — `snap_status` phải trả `{"connected":true}`.
  Không cần Chrome mở trang app nào cả: review chỉ đọc `kb/`, không lái trình duyệt.
- Biết slug của bài cần chấm. Chưa biết thì `ls kb/` (Bash/Glob — phiên tương tác có sẵn
  filesystem, khác một job spawn) để liệt kê, hoặc gọi `snap_comments()` không kèm `slug` để xem
  bài nào đang có feedback chờ.

## Quy trình

### 1. Xác định bài, và bài đó thuộc dạng nào

`kb/<slug>/job.json` tồn tại → bài **job-kind**, có `steps[]` tách riêng, review đầy đủ được
theo mục 2 bên dưới. Chỉ có `kb/<slug>.md` (không có `job.json`) → bài **flat**, không có `els`
tách theo bước — review vẫn chạy được nhưng hẹp hơn: đọc markdown + nhìn ảnh nó nhúng qua
`snap_view`, bỏ qua các luật liên quan `els`/toạ độ, file finding chủ yếu `owner: "write"`.

### 2. Spawn agent review — prompt mẫu

Dùng công cụ Agent, `subagent_type: "general-purpose"`, prompt tự viết theo khuôn dưới (dịch từ
`REVIEW_ROLE` trong `snap-bridge/kb-job.js`, cùng nội dung với review stage của job "author" nên
hai đường cho ra chuẩn giống nhau):

```
Review bài KB "<slug>" trong kb/. BẠN KHÔNG PHẢI người đã chụp ảnh hay viết bài này — đó là lý
do bạn được gọi riêng. Chỉ có pixel trước mắt bạn, đọc như một người đọc chưa từng thấy app này.

BẠN KHÔNG SỬA GÌ CẢ. Không snap_render_job, không snap_export, không snap_open/snap_add, không
snap_write_kb, không ghi job.json. Việc duy nhất bạn làm là gọi snap_findings.

Cách làm:
1. snap_job({slug:"<slug>"}) để đọc bài (bỏ qua nếu là bài flat — đọc kb/<slug>.md bằng Read).
   snap_view trên MỌI ảnh đã xuất — grid:true khi cần ĐỌC một toạ độ thay vì áng chừng.
2. snap_comments({slug:"<slug>"}) — một pin người dùng đã ghim là một finding có sẵn người
   đứng sau nó. Đừng resolve, chỉ route nó vào finding.
3. Kiểm tối thiểu theo .claude/skills/kb/PLACEMENT_PLAYBOOK.md — mọi luật đã gắn nhãn
   `(hard rule)`: #-1 (đừng đoán toạ độ khi có element để neo), #0 (không tràn khung), #2 (target
   có mặt/rõ/đúng trạng thái NGAY TRONG ẢNH NÀY), #6 (không còn PII lộ — nhìn cả một ảnh **ở
   giữa** và ảnh **cuối** bài, không chỉ ảnh đầu, xem mục "RÀ SOÁT 2026-09-11" trong playbook),
   #7 (đọc toạ độ bằng lưới `snap_view({grid:true})` khi cần một số cụ thể, đừng áng chừng bằng
   mắt), và **#8 (callout đánh số bước phải là `step`, không phải `label` — đây là lỗi lặp lại
   nhiều nhất trong lịch sử playbook, đã lộ ở cả 4 bài đã ship trước khi luật này được viết ra;
   đừng bỏ qua khoản này chỉ vì nó không nằm trong 5 luật cũ).** Cộng thêm #1 (callout không đè
   lên target), #4 (bước 1 định hướng đúng menu), #5 (có ít nhất một zoom vào chi tiết quyết
   định) — không gắn nhãn hard rule trong playbook nhưng vẫn áp dụng cho mọi bài. Rồi tới chữ đối
   chiếu ảnh (văn bản có tả đúng cái đang hiện không?), đối chiếu tài liệu tham khảo nếu có, thứ
   tự heading, và độ phủ so với yêu cầu gốc (một bước yêu cầu mà không ai chụp cũng là một
   finding).
4. snap_findings MỘT LẦN, ở cuối. Route: owner "capture" cho mọi thứ hình ảnh (chụp lại, dời/
   đổi loại/xoá annotation), "write" cho văn xuôi. severity "blocker" chỉ khi sai/gây hiểu nhầm
   thật; gu thẩm mỹ là "nit". verdict "pass" chỉ khi không còn blocker nào.
5. snap_learn khi finding là một luật mà bài sau không nên phải học lại — `category:"placement"`
cho lỗi hình ảnh/vị trí (owner "capture"), `category:"content"` cho lỗi câu chữ/cấu trúc (owner
"write").

Cụ thể đủ để hành động: gọi tên element, bước, đoạn chữ. "Callout nhìn hơi lệch" không route
được cho ai.
```

### 3. Nhận kết quả, báo lại người dùng

Agent con trả lời xong (verdict + findings + summary) — báo lại nguyên văn cho người dùng, kèm
nhắc bài học "reviewer không phải chân lý tuyệt đối" ở trên nếu có finding "blocker" đáng ngờ.
`verdict: "changes-requested"` thì nói rõ bước tiếp theo là gì:

- Bài có `job.json`: sửa `els` theo finding rồi `snap_render_job`, hoặc mở KB Studio → gõ prompt
  dưới bài (job "revise", xem `SKILL.md` của `/kb`) để một agent khác tự áp finding.
- Bài flat: sửa thẳng `kb/<slug>.md` bằng `snap_write_kb` hoặc tay.

`verdict: "pass"` thì chỉ cần báo cho người dùng biết, không có việc gì thêm.

## Không làm

- **Không** tự sửa job.json/markdown trong lúc review — đó là việc của stage khác (xem mục "Vì
  sao phải spawn agent MỚI" ở trên, đây là ranh giới có chủ đích, không phải thiếu sót).
- **Không** cần Chrome/tab nào mở — review chỉ đọc file tĩnh trong `kb/`.
- **Không** đếm round tự — `snap_findings` tự tính round từ file `review.json` đã có trên đĩa
  khi được gọi ngoài một job đang chạy (xem `currentReviewRound()` trong `kb-job.js`), nên gọi
  nhiều lần trên cùng một bài vẫn ra số round tăng dần đúng, không cần theo dõi tay.
