# Showroom Focus And Color Design

## Muc tieu

Nang cap khoi `Interactive Showroom` tren trang chu de model xe:

- mo ra voi kich thuoc lon, gan bo cuc cua anh tham chieu dau tien
- van cho phep user `drag` de xoay xe nhu hien tai
- khong con cho phep `free zoom`
- ho tro `double click` vao bat ky diem nao tren model de focus camera vao diem do voi mot muc zoom co dinh
- ho tro `double click` vao vung ngoai xe de reset ve view tong the
- ho tro doi `mau son than xe` bang panel mau luon hien san trong khung 3D

Day la mot nang cap hanh vi cho `showroom-stage`, khong phai mo rong thanh mot 3D configurator day du.

## Pham vi

Spec nay chi ap dung cho khu vuc:

- `#showroom-stage`
- `#hero-3d-shell`
- logic trong `assets/js/hero-3d.js`
- phan UI panel mau trong `index.html`
- phan style lien quan trong `assets/css/home.css`

Ngoai pham vi:

- khong thay doi cinematic intro video
- khong them caption, hotspot label, hay thong tin focus tren giao dien
- khong doi mau kinh, mam, den, noi that, hoac cac chi tiet trim
- khong them pan camera
- khong them shader nang, mo cua, hoac configurator thuong mai

## Trai nghiem duoc chot

### Trang thai mac dinh

- Khi user den section showroom, xe hien o kich thuoc lon va chiem khong gian chinh cua san khau.
- User van co the `drag` chuot de xoay xe quanh tam mac dinh.
- User khong the zoom bang wheel, trackpad, hay pinch.
- Panel mau luon hien san trong khung 3D.

### Focus bang double click

- `Double click` trung vao model se kich hoat focus mode.
- He thong phai raycast vao dung diem user vua click tren model.
- Camera se tween toi mot `focus distance` co dinh, khong zoom tuy y theo tung diem.
- Sau khi focus, `controls.target` duoc dat thanh diem hit, va user chi con xoay quanh diem do.
- Giao dien khong hien them label, caption, hay text phu.

### Reset bang double click ngoai xe

- `Double click` vao vung khong trung model duoc xem la lenh reset.
- Reset dua `camera.position` va `controls.target` ve view tong the mac dinh.
- Mau dang chon cua xe khong bi reset.

### Doi mau xe

- Panel mau luon hien san va khong bi an theo hover.
- Co 7 mau mac dinh:
  - do
  - xanh duong
  - xanh la
  - vang
  - hong
  - trang
  - den
- Khi doi mau, chi `phan son than xe` thay doi.
- Cac thanh phan khac cua model giu nguyen.

## Kien truc trai nghiem

Khoi showroom duoc to chuc thanh 3 lop:

### 1. 3D stage

Chua:

- scene
- camera
- renderer
- light
- model GLB
- orbit controls

### 2. Interaction layer

Xu ly:

- drag xoay xe
- raycast double click
- focus theo hit point
- reset khi double click ngoai model

### 3. Luxury control layer

Chua:

- panel mau noi trong khung 3D
- trang thai mau dang duoc chon

## Kien truc ky thuat de xuat

### HTML

`index.html` se duoc bo sung mot panel mau ben trong `#hero-3d-shell`.

Yeu cau:

- panel nam trong khung 3D, uu tien goc phai duoi de can bang thi giac
- panel luon hien san
- panel gon, sang, khong pha bo cuc luxury dark

### CSS

`assets/css/home.css` se bo sung:

- style cho panel mau floating
- style cho cac swatch mau
- style cho trang thai active
- tinh chinh kich thuoc va ty le stage de xe mac dinh lon hon hien tai

### JavaScript

`assets/js/hero-3d.js` la noi chua toan bo logic moi:

- khoa zoom tu do
- raycast theo diem double click
- tween camera vao focus distance co dinh
- cap nhat `controls.target` theo hit point
- reset ve camera mac dinh khi click ngoai model
- tim va quan ly `paintMeshes`
- doi mau than xe

`assets/js/home.js` chi giu vai tro khoi tao module, khong nen chua logic focus hay doi mau.

## Rule camera va control

### Camera mac dinh

- Camera mac dinh duoc dat lai de xe lon hon ro ret so voi implementation hien tai.
- Goc nhin van phai giu duoc feel showroom premium, khong bien thanh shot ky thuat.
- `OrbitControls` van duoc dung de cho phep xoay.

### Gioi han control

- `enableRotate = true`
- `enableZoom = false`
- `enablePan = false`
- damping van duoc giu de chuyen dong mem

### Focus mode

- `double click` trung xe thi tinh raycast hit point
- camera tween toi vi tri moi theo huong nhin hien tai, nhung o cung mot `focus distance`
- `controls.target` duoc cap nhat thanh hit point
- user tiep tuc xoay quanh hit point vua focus

### Reset mode

- `double click` ngoai xe thi reset
- reset phai dua ca camera va target ve trang thai tong the
- reset khong doi mau dang active

## Focus strategy

Chot huong `raycast + fixed distance focus`.

Ly do:

- dat dung yeu cau "2 click full moi diem tren model"
- giu duoc cam giac tuong tac that
- van dam bao trai nghiem nhat quan nho khoang cach focus co dinh

Khong dung huong preset focus zones trong version nay, vi no lam giam do chinh xac cua tuong tac theo diem click.

## Rule doi mau than xe

### Nhan dien mesh duoc phep doi mau

He thong phai xac dinh mot tap `paintMeshes` gom cac mesh thuoc than xe.

Yeu cau:

- khong doi mau cac mesh cua kinh
- khong doi mau mam va lop
- khong doi mau den
- khong doi mau noi that
- khong doi mau cac chi tiet den trim

Neu cac mesh than xe dang dung chung material voi chi tiet khac, can `clone material` truoc khi doi mau de tranh loang mau sang thanh phan khong mong muon.

### Bang mau mac dinh

Can co danh sach mau co key ro rang de map vao UI va JS:

- `red`
- `blue`
- `green`
- `yellow`
- `pink`
- `white`
- `black`

Moi mau can co:

- ten key on dinh trong code
- gia tri mau hex
- ten hien thi de ho tro mo rong UI sau nay

### Hanh vi UI

- Mot mau mac dinh duoc active ngay khi khoi tao
- Khi user chon mau moi, toan bo `paintMeshes` cap nhat cung luc
- Swatch dang active hien thi ro nhung tinh te

## Edge case va fallback

### Load model loi

- Neu model load fail hoac qua timeout, fallback poster hien nhu co san.
- Panel mau khong duoc gay giao dien vo neu model that bai.

### Raycast khong trung model

- Moi `double click` khong trung model deu duoc xem la reset.

### Focus qua gan hoac xuyen model

- Camera focus can co gioi han hop ly de tranh:
  - chui vao trong mesh
  - cat mat xe
  - tao goc nhin xau

Implementation phai clamp khoang cach toi thieu sau khi tinh vi tri focus, nhung van giu tinh than `fixed focus distance` de tranh camera di qua sat hoac xuyen model.

## Tieu chi dat

Tinh nang duoc xem la dat khi:

1. Xe mo ra o showroom co kich thuoc lon hon ro ret so voi hien tai va gan anh tham chieu mong muon.
2. User van drag de xoay xe duoc.
3. Wheel, trackpad zoom, va pinch khong con lam thay doi khoang cach camera.
4. `Double click` vao nhieu diem khac nhau tren xe deu co the focus.
5. Sau khi focus, user xoay quanh dung diem vua chon.
6. `Double click` ngoai xe reset dung ve view tong the.
7. Panel mau luon hien san trong khung 3D va khong pha bo cuc.
8. Ca 7 mau deu hoat dong.
9. Chi phan son than xe doi mau.
10. Fallback van an toan neu model loi.

## File du kien tac dong khi implementation

- `index.html`
- `assets/css/home.css`
- `assets/js/hero-3d.js`

Khong co file nao khac bat buoc phai sua cho pham vi nay.
