Mục tiêu:
Sửa đúng hiệu ứng click ở section collection-3d trên trang mới làm, để model 3D bung ra theo kiểu “tách khỏi card”, không làm tối sầm toàn màn hình, và không đụng sang các logic/carousel khác không liên quan.

Phạm vi:
Chỉ chỉnh phần UI/interaction khi click vào card active trong collection-3d.
Không sửa dữ liệu xe, không đổi camera preset mặc định, không đổi logic prev/next, không đổi detail page, không đổi các section khác của homepage.

Hành vi mong muốn:

Khi user click vào card đang active, phần model 3D phải bung ra thành một lớp nổi riêng.
Model nổi phải lớn hơn card hiện tại và đè lên trên card, không còn bị “nhốt” trong khung card.
Card gốc vẫn giữ nguyên vị trí cũ.
Card gốc vẫn giữ phần text/meta/button bên dưới.
Riêng vùng viewer/model trong card gốc phải trở thành trạng thái trống, để nhìn rõ là model đã tách ra ngoài.
Toàn màn hình và các phần nền phía sau chỉ bị phủ đen nhẹ khoảng 30%.
Không được làm nền tối thui như hiện tại.
Khi model đang mở, phải ẩn hẳn các phần sau:
collection-3d__arrow
collection-3d__progress
collection-3d__header
Khi model đang mở, chỉ tập trung vào:
card active ở dưới
model nổi phía trên
nút đóng
Bấm Escape, bấm nút close, hoặc bấm ra ngoài vùng model nổi thì đóng trạng thái mở rộng.
Khi đóng, model phải quay lại đúng vị trí cũ trong card, không bị mất, không nhảy sai card.
Yêu cầu layout khi mở:

Không scale full card thành modal.
Không biến cả card thành nền trong suốt rồi hide toàn bộ body như bản fix sai trước đó.
Chỉ tách riêng model-viewer hoặc phần render model ra một floating layer.
Floating layer phải nằm trên overlay và trên card.
Card active vẫn nằm dưới floating model như một “bệ gốc”.
Viewer area trong card có thể hiện trạng thái placeholder trống rất nhẹ, nhưng không quá nổi.
Yêu cầu visual:

Overlay nền: rgba(0, 0, 0, 0.3) hoặc tương đương 30%.
Model nổi phải to hơn rõ ràng so với lúc còn trong card.
Model nổi phải có cảm giác premium, sạch, không thêm khung modal nặng nề.
Không thêm hiệu ứng làm layout rung hoặc nhảy mạnh.
Animation mở/đóng nên mượt, nhanh, sang.
Không đổi font, màu thương hiệu, spacing text hiện có của card.
Ràng buộc kỹ thuật:

Không sửa dữ liệu trong COLLECTION_CARS.
Không sửa các giá trị camera preset trừ khi thật sự cần cho trạng thái expanded.
Không đụng phần hero 3D, detail page, hoặc section khác.
Không thay đổi hành vi click của nút Xem chi tiết.
Không refactor lan rộng file nếu không cần.
Chỉ sửa tối thiểu ở JS/CSS liên quan đến expand/collapse của collection-3d.
Gợi ý triển khai:

Giữ card.is-expanded chỉ là state logic.
Tạo một floating model stage riêng cho trạng thái expanded.
Khi mở:
lấy đúng model-viewer của card active
render hoặc move nó sang floating stage
thêm overlay 30%
ẩn arrows/header/progress
giữ body/text của card gốc
Khi đóng:
trả model-viewer về đúng viewer container ban đầu
remove overlay/state
hiện lại arrows/header/progress
Tiêu chí hoàn thành:

Click card active thấy model bung ra ngoài card, to hơn card.
Card gốc vẫn còn text/nút bên dưới.
Viewer trong card gốc nhìn như trống vì model đã tách ra.
Nền chỉ tối nhẹ 30%.
Header, arrows, progress bị ẩn hẳn khi expanded.
Đóng/mở nhiều lần không lỗi.
Chuyển card prev/next sau khi đóng vẫn hoạt động bình thường.
Không ảnh hưởng section khác.