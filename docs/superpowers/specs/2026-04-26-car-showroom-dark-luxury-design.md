# Car Showroom Dark Luxury Frontend Design

## Muc tieu

Xay dung mot website showroom oto `frontend-only` theo phong cach `cinematic / dark luxury`, tap trung vao trai nghiem thi giac cao cap, storytelling bang scroll, va model 3D Lamborghini duoc nhung tu Sketchfab. Du an khong can backend, nhung van phai the hien ro nang luc to chuc giao dien, responsive, va tuong tac frontend bang `HTML`, `CSS`, `JavaScript`, `Bootstrap 5`, `jQuery`, va `GSAP`.

Website duoc tach tu file mau `mau_claude/carshowroom.html` thanh 3 trang doc lap, co cau truc tep ro rang, de mo rong va de chuyen thanh bai nop hoan chinh.

## Pham vi

- Chi lam frontend.
- Su dung model 3D Lamborghini tu file `model_iframe`.
- Tai su dung co chon loc khoang `60-70%` phan manh nhat tu file mau `carshowroom.html`.
- Xay dung toi thieu `3 trang`:
  - `index.html`
  - `cars.html`
  - `car-detail.html`
- Co cau truc thu muc ro rang:
  - `/css`
  - `/js`
  - `/images`

## Non-Negotiable Requirements

Day la nhom yeu cau bat buoc phai xuat hien trong ca spec va implementation plan de tranh lac scope:

- `Structure`: To chuc thu muc ro rang voi `/css`, `/js`, `/images`.
- `HTML5 semantic`: Su dung `header`, `nav`, `section`, `footer` va cac the semantic phu hop.
- `Bootstrap 5`: Su dung `Grid System` va it nhat cac component sau trong du an:
  - `Navbar`
  - `Card`
  - `Modal`
  - `Carousel`
- `Responsive`: Bat buoc hoat dong tot tren `desktop`, `tablet`, va `mobile`.
- `CSS customization`: Mau sac, typography, border, spacing, va component skin phai duoc tuy bien de tranh cam giac Bootstrap mac dinh.
- `jQuery interactions`: Co it nhat `2` su kien tuong tac thuc te, vi du:
  - filter xe
  - mo quick-view modal
  - scroll state / active nav / CTA highlight
- `Page count`: Toi thieu `3 trang`.
- `Component description`: Trong spec va plan phai mo ta ro thanh phan nao nam o trang nao va dong vai tro gi.

## Concept tong the

Website la mot `digital luxury showroom` cho sieu xe, trong do giao dien khong chi de hien thi thong tin ma con tao cam giac nhu dang xem trailer thuong hieu cua mot hang xe cao cap.

Huong trai nghiem duoc chot:

1. `Trang chu` ban cam xuc va dinh vi thuong hieu
2. `Trang danh sach xe` ban su lua chon va kha nang kham pha
3. `Trang chi tiet xe` ban quyet dinh cuoi cung bang su ket hop giua visual va thong so

Model 3D Lamborghini khong dung nhu mot widget ky thuat, ma phai duoc dat trong mot bo cuc co anh sang, text, va framing de tro thanh centerpiece cua thuong hieu.

## Huong tach tu file mau

Chon huong `selective extraction`.

### Giữ

- Tone mau `dark / gold / silver`
- Cam giac typography cinematic
- Nav tinh te, marquee strip, intro thuong hieu
- Cars grid concept
- Experience / premium-service section
- Testimonials va CTA tone

### Bo hoac thay

- Custom cursor neu gay rom ra va kho giu on dinh tren mobile
- SVG car hero cu khi da co model 3D that
- Motion trang tri qua day neu tranh spotlight voi iframe 3D
- Toan bo CSS inline rat dai trong mot file duy nhat

### Nguyen tac chuyen doi

- Tu `one-page demo` sang `multi-page showroom`
- Tu `anchor navigation` sang dieu huong giua 3 tep HTML that
- Tu `cars section` minh hoa sang `catalog page` co logic thuc te hon
- Tu `contact section` cuoi trang sang he CTA + modal xuyen suot nhieu trang

## Cau truc trang

### 1. `index.html` - Trang chu

Muc dich:

- Tao an tuong thuong hieu ngay tu man hinh dau
- Gioi thieu model 3D Lamborghini trong mot hero dang premium stage
- Dan nguoi dung den danh sach xe hoac dat lich lai thu

Noi dung chinh:

- Sticky navbar
- Hero split layout:
  - cot trai: eyebrow, headline, mo ta, 2 CTA, gia tri flagship
  - cot phai: `model_iframe` trong khung luxury frame
- Marquee strip
- Intro thuong hieu
- Featured collection teaser
- Premium experience section
- Testimonial strip
- CTA dat lich lai thu
- Footer

### 2. `cars.html` - Danh sach xe

Muc dich:

- Bien phan cars grid trong file mau thanh trang kham pha san pham thuc su
- Dung Bootstrap card/grid de the hien yeu cau ky thuat
- Cung cap it nhat 2 tuong tac jQuery co y nghia

Noi dung chinh:

- Navbar thong nhat
- Hero ngan / page banner
- Filter bar
- Car grid
- Quick view modal
- CTA den trang chi tiet
- Footer

### 3. `car-detail.html` - Chi tiet xe

Muc dich:

- Can bang giua cinematic va thong tin
- Tao duoc cai "wow" ban dau roi sau do dua nguoi dung xuong khu thong so, gallery, va review

Noi dung chinh:

- Navbar thong nhat
- Detail hero voi visual lon, gia, tag, CTA
- Gallery hoac `Bootstrap Carousel`
- Tech/spec blocks
- Lifestyle / ownership highlights
- Review / testimonial
- CTA dat lich lai thu hoac lien he
- Footer

## Hero concept cho model 3D

Hero trang chu dung bo cuc `text trai / model phai`.

### Cot trai

- Eyebrow nho theo format collection nam
- Headline lon 2-3 dong, tinh poster
- Mo ta ngan nhan vao trai nghiem showroom so cao cap
- Hai CTA:
  - `Kham pha bo suu tap`
  - `Dat lich lai thu`
- Mot stat strip hoac price mark tao cam giac flagship

### Cot phai

- Nhung `model_iframe` Lamborghini
- Dat iframe trong mot `luxury frame` gom:
  - nen toi
  - vien gold mo
  - shadow sau
  - glow nhe
- Co label phu nhu `Interactive 3D Preview`
- Co micro-copy huong dan nhu `drag to explore`

### Motion

- Text reveal truoc bang stagger animation
- Model wrapper fade + slide tu phai vao
- Hero co glow / particle / gradient background rat tiet che
- Khi scroll, hero thu nhe de nhuong nhac cho section tiep theo
- Tren mobile:
  - text hien truoc
  - model xuong duoi
  - iframe thap hon de tranh nang man hinh

## Component map

### Bootstrap 5

- `Navbar`: dung tren ca 3 trang, co collapse menu cho mobile
- `Grid`: xuyen suot cho hero, section, cards, detail layout
- `Card`: dung tren `cars.html`
- `Modal`: dung cho quick view hoac mini booking flow
- `Carousel`: dung tren `car-detail.html` cho gallery / interior-exterior showcase

### jQuery

Toi thieu 2 su kien bat buoc, de xuat trien khai 3 su kien:

1. Filter xe theo dong / muc gia tren `cars.html`
2. Quick view modal khi click tren car card hoac nut
3. Scroll-based class toggle cho navbar / CTA / active state

### GSAP

- Hero intro animation tren `index.html`
- Scroll reveal cho intro, featured collection, testimonials, CTA
- Parallax nhe cho text, gradient, glow, va background layers
- Section reveal tren `car-detail.html` khi di qua gallery va specs

## Kien truc tep

### HTML

- `index.html`
- `cars.html`
- `car-detail.html`

### CSS

- `/css/base.css`
  - reset nhe
  - color variables
  - typography
  - utility chung
- `/css/components.css`
  - navbar
  - buttons
  - cards skin
  - modal skin
  - section header
- `/css/home.css`
  - hero 3D
  - marquee
  - intro
  - testimonials
  - CTA
- `/css/catalog.css`
  - filter bar
  - product grid
  - card interaction visuals
- `/css/detail.css`
  - detail hero
  - specs
  - gallery
  - review blocks

### JS

- `/js/main.js`
  - shared interactions
  - nav behavior
  - helper hooks
- `/js/home.js`
  - home hero animation
  - section reveal
  - model-stage motion
- `/js/catalog.js`
  - filtering
  - quick-view modal
  - card hover / active logic
- `/js/detail.js`
  - carousel enhancement
  - detail reveal
  - CTA interaction

### Images

- `/images`
  - hero texture / overlay
  - car thumbnails
  - gallery images
  - background support assets

## Visual language

### Bang mau

- Nen chinh: gan den, deep charcoal, midnight black
- Mau nhan: gold sang trong
- Mau phu: silver xam, ivory nhat
- Accent rat han che de tranh mat chat luxury

### Typography

- Heading co chat poster, uppercase, tracking rong
- Body text can clean, thoang, de doc
- Chu ky thuat / caption dung mono de tao chat automotive-tech

### Chat lieu giao dien

- Soft glow
- Gradient sau
- Border mo
- Glass / smoked-panel rat tiet che
- Khong de giao dien roi vao phong cach Bootstrap mac dinh

## Responsive strategy

- Desktop: hero split layout day du, section co khoang tho rong
- Tablet: grid giam cot, spacing giu sang, iframe scale hop ly
- Mobile:
  - navbar collapse
  - hero xep doc
  - CTA day du de bam
  - card stack 1 cot hoac 2 cot tuy breakpoint
  - carousel va modal phai de dung ngon tay

Responsive khong chi la "khong vo layout", ma con phai giu duoc cam giac premium tren man hinh nho.

## Data strategy

Vi day la frontend-only, du lieu xe duoc khai bao duoi dang JS object static trong `catalog.js` va duoc tai su dung o `detail.js`.

Can co toi thieu:

- ten xe
- dong xe
- gia
- anh dai dien / visual
- thong so chinh
- badge nhu `new`, `limited`, `flagship`

Lien ket giua `cars.html` va `car-detail.html` dung query string don gian cho id xe, de trang chi tiet tai dung du lieu cho mot mau flagship trong phase dau ma khong can backend.

## Component description by page

### `index.html`

- `Header / Navbar`
  - dieu huong chinh, CTA dat lich
- `Hero Split`
  - section trung tam, show model 3D
- `Marquee Strip`
  - tao nhac dieu brand
- `Brand Intro`
  - dinh vi showroom
- `Featured Collection`
  - teaser mot vai mau xe noi bat
- `Experience Section`
  - noi ve luxury service / ownership
- `Testimonials`
  - social proof
- `Footer`
  - thong tin va dieu huong cuoi

### `cars.html`

- `Page Banner`
  - mo dau trang danh sach
- `Filter Bar`
  - xu ly jQuery interaction
- `Car Card Grid`
  - dung Bootstrap Card + Grid
- `Quick View Modal`
  - dung Bootstrap Modal + jQuery trigger
- `CTA Strip`
  - dan sang trang chi tiet / dat lich

### `car-detail.html`

- `Detail Hero`
  - visual lon, ten xe, gia, CTA
- `Gallery Carousel`
  - Bootstrap Carousel
- `Specification Blocks`
  - thong so va highlights
- `Review / Quote Block`
  - bo sung trust
- `Final CTA`
  - dat lich lai thu / lien he

## Acceptance criteria

Du an duoc xem la dat khi:

1. File mau `carshowroom.html` da duoc tach thanh it nhat 3 trang ro vai tro.
2. Hero trang chu da tich hop `model_iframe` Lamborghini theo bo cuc split-layout.
3. Co day du `Bootstrap Navbar`, `Card`, `Modal`, `Carousel`.
4. Co it nhat 2 tuong tac `jQuery` thuc te.
5. Co animation vao trang va scroll-based effects bang `GSAP`.
6. Giao dien responsive tot tren mobile va tablet.
7. CSS da duoc custom du manh de khong con cam giac Bootstrap mac dinh.
8. Cau truc tep dung theo `/css`, `/js`, `/images`.
9. HTML dung the semantic ro rang.
10. Moi trang co muc dich va component ro rang nhu trong spec.

## Ngoai pham vi

- Backend
- Dang nhap / dang ky
- Thanh toan
- CMS
- Quan tri du lieu
- 3D engine tu viet
- Xu ly API phuc tap

## Rui ro va cach tranh

- `Risk`: Embed 3D trong iframe trong nhu roi rac
  - `Mitigation`: dat trong luxury frame, canh sang, spacing, overlay text hop ly
- `Risk`: Qua nhieu hieu ung lam giao dien nang
  - `Mitigation`: uu tien motion tiet che, giam intensity tren mobile
- `Risk`: Tai su dung file mau qua nhieu dan den code rom
  - `Mitigation`: selective extraction, tach CSS/JS ro vai tro ngay tu dau
- `Risk`: Bootstrap lo ro mac dinh
  - `Mitigation`: skin lai typography, button, card, modal, spacing, background

## Huong sang implementation plan

Implementation plan sau nay phai co mot muc rieng ten `Guardrails / Non-Negotiable Requirements`, lap lai dung nhom yeu cau bat buoc o spec nay. Moi phase trong plan phai chi ro dang thuc hien component nao, tren trang nao, va dang dap ung yeu cau bat buoc nao de tranh lac.
