# Car Showroom Requirements Consolidated Spec

## Muc dich tai lieu

Tai lieu nay khong thay the design spec chi tiet. Muc dich cua no la gom lai toan bo yeu cau co tinh rang buoc de trong qua trinh lam bai khong bi lech y hoac hieu sai scope.

Day la `spec tong hop yeu cau`, dung nhu mot `single source of truth` cho:

- pham vi bai lam
- rang buoc ky thuat
- cach hieu dung ve "3 trang"
- thanh phan bat buoc
- tieu chi dat bai

## Dinh nghia dung ve pham vi

Du an la website showroom oto phong cach `cinematic / dark luxury`, lam theo huong `frontend-only`.

Khong dung backend.

Khong tach thanh nhieu file HTML doc lap de gia lap nhieu trang. Website co `1 file index.html` lam diem vao chinh, nhung van tao duoc trai nghiem nhu co nhieu trang ben trong cung mot frontend.

## Cach hieu dung ve "3 trang"

Yeu cau "toi thieu 3 trang" trong bai nay duoc hieu la `3 khu vuc noi dung chinh / 3 view chinh / 3 trang trai nghiem` ben trong website, khong bat buoc la 3 file HTML rieng.

Ba trang trai nghiem can co:

1. `Trang chu`
2. `Danh sach xe`
3. `Chi tiet xe`

Huong duoc chot:

- `Trang chu` la khu vuc cinematic cuon doc, ke chuyen thuong hieu
- `Danh sach xe` la mot view rieng trong cung `index.html`
- `Chi tiet xe` la mot view rieng trong cung `index.html`
- Dieu huong giua cac view phai tao cam giac "chuyen trang", nhung van trong mot he frontend duy nhat

## Huong trai nghiem duoc chot

Website di theo huong `hybrid`:

- phan mo dau la storytelling / scroll-based homepage
- khi nguoi dung bam vao bo suu tap hoac mot mau xe, giao dien chuyen sang view danh sach xe hoac chi tiet xe
- co the dung:
  - an / hien section
  - state class
  - hash navigation
  - jQuery state switching

Muc tieu la giu duoc cam giac cinematic cua hero trang dau, nhung van co logic dieu huong ro rang giua 3 phan lon.

## Model 3D bat buoc

Website phai nhung model 3D Lamborghini tu Sketchfab bang iframe.

Model nay la `diem nhan trung tam` cua phan mo dau, khong phai mot widget phu.

Yeu cau cho model:

- dat o hero dau trang
- bo cuc `text trai / model phai`
- co frame luxury toi mau, glow nhe, border gold mo
- giu tinh than showcase cao cap, khong de iframe trong roi rac

## Rang buoc ky thuat bat buoc

### 1. Structure

Phai co cau truc thu muc ro rang:

- `/css`
- `/js`
- `/images`

### 2. HTML5 semantic

Phai dung cac the semantic phu hop:

- `header`
- `nav`
- `main`
- `section`
- `footer`

### 3. Bootstrap 5

Phai dung `Bootstrap 5` va co toi thieu cac thanh phan sau:

- `Navbar`
- `Card`
- `Modal`
- `Carousel`

Ngoai ra phai dung `Bootstrap Grid System` de chia bo cuc va xu ly responsive.

### 4. Responsive

Bat buoc responsive tren:

- desktop
- tablet
- mobile

Responsive khong chi dung o muc "khong vo layout", ma con phai giu duoc chat `dark luxury` tren man hinh nho.

### 5. CSS customization

Khong duoc de giao dien trong giong Bootstrap mac dinh.

Can tuy bien:

- bang mau
- typography
- button
- card
- modal
- carousel skin
- spacing
- background / overlay / border / glow

### 6. jQuery interactions

Phai co it nhat `2` tuong tac dung `jQuery`.

Cac huong phu hop:

- filter xe
- quick view modal
- chuyen view giua homepage / collection / detail
- scroll state cho navbar
- active state cho CTA hoac menu

### 7. GSAP va scroll-based effects

Phai co animation su dung `GSAP`.

Yeu cau uu tien:

- intro animation cho hero
- reveal theo scroll
- parallax nhe
- transition giua cac khu vuc noi dung

## Thanh phan noi dung bat buoc

### A. Trang chu

Phai co:

- navbar
- hero cinematic
- model 3D Lamborghini
- heading / subheading / CTA
- section gioi thieu thuong hieu
- teaser bo suu tap xe
- section trai nghiem / premium service
- testimonial hoac social proof
- footer

### B. Danh sach xe

Phai co:

- tieu de khu vuc bo suu tap
- bo loc hoac dieu huong xe
- grid/card hien thi nhieu mau xe
- nut xem nhanh hoac nut xem chi tiet
- modal quick view

### C. Chi tiet xe

Phai co:

- hero rieng cho mau xe
- thong so noi bat
- gallery hoac `Carousel`
- CTA quay lai hoac dat lich
- mot khoi review / quote / highlight

## Du lieu va logic frontend

Vi day la frontend-only, du lieu xe nen duoc quan ly bang `JavaScript object` hoac mang du lieu static trong thu muc `/js`.

Can co toi thieu cac truong:

- ten xe
- dong xe
- gia
- mo ta ngan
- thong so chinh
- nhan phan loai neu can

Mot view danh sach xe va mot view chi tiet xe co the dung chung nguon du lieu nay.

## Huong tai su dung file mau

Da co file mau:

- `mau_claude/carshowroom.html`

Vai tro cua file nay la:

- lay tone visual
- lay y tuong section manh
- lay mot phan motion / typography / khong khi giao dien

Khong nen copy nguyen khoi theo kieu mot file demo dai va giu nguyen cau truc cu.

Huong dung la:

- chon loc
- tinh gon
- sap xep lai theo dung flow 3 view trong `index.html`

## Tieu chi dat bai

Bai lam duoc xem la dat khi dong thoi dap ung cac dieu kien sau:

1. Chi dung frontend, khong co backend
2. Co `1 index.html` lam diem vao chinh
3. Van the hien ro `3 trang trai nghiem`:
   - trang chu
   - danh sach xe
   - chi tiet xe
4. Co model 3D Lamborghini tu Sketchfab trong hero
5. Co `Bootstrap Navbar`
6. Co `Bootstrap Card`
7. Co `Bootstrap Modal`
8. Co `Bootstrap Carousel`
9. Co it nhat `2` tuong tac `jQuery`
10. Co `GSAP` animation va scroll effect
11. Co structure `/css`, `/js`, `/images`
12. Co HTML semantic ro rang
13. Responsive tot tren mobile va tablet
14. Mau sac va giao dien da duoc custom, khong con cam giac Bootstrap mac dinh

## Ngoai pham vi

Khong bao gom:

- backend
- API that
- dang nhap / dang ky
- dat hang / thanh toan
- CMS
- dashboard admin
- xu ly 3D nang nhu Three.js

## Ghi chu su dung tai lieu nay

Khi viet plan hoac implement, moi quyet dinh phai duoc doi chieu nguoc lai voi tai lieu nay.

Neu co bat ky cho nao xung dot giua implementation va tai lieu nay, uu tien sua implementation theo tai lieu nay, tru khi nguoi dung yeu cau doi scope ro rang.
