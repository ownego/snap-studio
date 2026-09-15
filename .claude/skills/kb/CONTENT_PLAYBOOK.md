<!-- ─────────────────────────────────────────────────────────────────────────
CONTENT PLAYBOOK — trí nhớ về cách VIẾT một bài KB cho đúng.

Em của `PLACEMENT_PLAYBOOK.md` (file đó dạy đặt annotation LÊN ảnh; file này dạy
viết CHỮ — văn phong, cấu trúc, khi nào cần một sơ đồ thay vì mô tả suông). Hai
trục khác nhau, đọc cả hai trước khi viết bài đầu tiên.

Luật văn phong/tông giọng/cấu trúc CỐ ĐỊNH của repo này (viết tiếng Anh, giải
thích ngắn gọn, không bịa hành vi app, khung bài `intro`/`steps[]`/`outro`, quy
tắc icon…) nằm ở `.claude/skills/kb/SKILL.md` mục "Nguyên tắc viết bài" — KHÔNG
lặp lại ở đây. File này chỉ có hai việc: (a) một, hai nguyên tắc CHƯA có chỗ nào
viết ra, và (b) chỗ để `snap_learn({category:"content"})` append bài học mỗi khi
người dùng sửa lại chữ/cấu trúc — y hệt cơ chế PLACEMENT_PLAYBOOK đã có cho
annotation, giờ áp dụng cho văn xuôi.

Định dạng: giống hệt PLACEMENT_PLAYBOOK.md — PRINCIPLES (luật ổn định) rồi
LEARNINGS (bài học có ngày, id `L-<ngày>-<chữ>` do `snap_learn` tự đóng dấu, mới
nhất ở trên). Append-only về LỊCH SỬ, không phải về THẨM QUYỀN — `supersedes`
đóng nhãn SUPERSEDED cho một learning đã bị chứng minh sai, không xoá nó.
────────────────────────────────────────────────────────────────────────── -->

# KB content — playbook

## PRINCIPLES (đọc trước khi viết)

1. **Một rule/logic (sắp xếp, tính điểm, điều kiện bật-tắt) cần một sơ đồ có ví
   dụ cụ thể, không phải một câu mô tả suông.** Nếu bước đang giải thích *cách
   app quyết định* thay vì *cái gì hiện trên màn hình*, chụp app không đủ — dùng
   `snap-bridge/kb-templates/concept.html` (mở như một tab bình thường qua
   `snap_new_tab`, sửa nội dung, chụp y như một screen thật) để dựng một card
   ví dụ A/B/C có số cụ thể ("giá trị cao nhất thắng", "input này → output
   này"). Trừu tượng để DẠY luật, tên control/label thật để bài vẫn bám app —
   đừng trộn: ví dụ dùng số tròn giả định, còn tên feature/nút thì phải là tên
   thật trong app.
2. **Bài dùng một khái niệm đã có bài riêng giải thích thì liên kết chéo.** Bài
   giải thích khái niệm trỏ tới bài hướng dẫn màn hình dùng nó, và ngược lại —
   đây chính là section `## Related articles` đã có sẵn trong khung bài
   (`SKILL.md` mục "Khung bài"), chỉ là một nguyên tắc hay bị quên: thêm liên
   kết ngay khi viết bài thứ hai nhắc tới khái niệm của bài thứ nhất, đừng để
   tới lúc review mới lục lại.

## LEARNINGS (mới nhất trước)

*(`snap_learn({text, category:"content"})` append vào đây mỗi khi người dùng
sửa lại một câu/cấu trúc/quyết định nội dung — khác với sửa vị trí annotation
(đó là `PLACEMENT_PLAYBOOK.md`). Ghi: ngày · viết/tổ chức sai thế nào · vì sao
sai · luật rút ra. Ngày và id do tool đóng dấu — đừng gõ ngày vào nội dung.
Chứng minh được một mục cũ sai thì truyền `supersedes` kèm id của nó.)*

(Chưa có learning nào của dự án — mục này đầy dần khi review và sửa bài thật.)
