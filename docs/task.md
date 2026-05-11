MINH HỌA NỘI DUNG FILE BÁO CÁO BÀI TẬP FRONT-END

Tên Project: Website Câu lạc bộ Bóng đá: Bảng xếp hạng, kết quả trận đấu, đội hình.

1. Số lượng trang (3 trang):

index.html (Trang chủ):
Header: Logo, Menu, Nút giỏ hàng (có badge số lượng), Form tìm kiếm.
Banner: Carousel chạy 3 ảnh khuyến mãi lớn.
Featured Products: Grid 4 cột, hiển thị 8 đôi giày bán chạy.
Footer: Thông tin liên hệ, social icons.
products.html (Danh sách sản phẩm):
Sidebar trái: Bộ lọc (Filter) theo hãng (Nike, Adidas), theo mức giá (Checkbox/Range slider).
Content phải: Danh sách giày (Grid 3 cột). Mỗi thẻ giày có nút "Thêm vào giỏ".
detail.html (Chi tiết sản phẩm):
Ảnh lớn bên trái (có thể click đổi ảnh con).
Thông tin bên phải: Tên, Giá, Chọn Size (Các ô vuông), Nút "Mua ngay".
Mô tả chi tiết và Sản phẩm liên quan bên dưới.

2. Kỹ thuật sử dụng: Bootstrap & jQuery
Sử dụng Bootstrap Card để thiết kế khung sản phẩm.
Sử dụng Bootstrap Badge để hiển thị số trên giỏ hàng.
jQuery:
Khi click nút "Thêm vào giỏ": Bay icon sản phẩm vào giỏ hàng hoặc hiện thông báo "Đã thêm thành công".
Số lượng trên icon giỏ hàng tăng lên 1.
Khi click vào ảnh nhỏ (thumbnail) ở trang chi tiết, ảnh lớn phải thay đổi theo.
