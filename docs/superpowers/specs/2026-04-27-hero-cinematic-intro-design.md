# Hero Cinematic Intro Design

## Muc tieu

Bo sung mot `cinematic intro hero` cho `trang chu` cua website APEX Motors, dat o `section dau tien` cua homepage, nham tao an tuong nhu opening scene cua mot phim quang cao sieu xe.

Intro nay khong thay the hoan toan trai nghiem 3D da co. No dong vai tro `lop mo dau thuong hieu`, trong khi `interactive 3D showroom` se duoc day xuong section tiep theo de nguoi dung kham pha sau khi scroll.

Muc tieu uu tien la `dep toi da`, theo huong `hybrid luxury`:

- xe la chu the chinh
- city co the hien chat stylized co chu dich
- canh can duoc xu ly bang anh sang, suong, framing, va motion de giam cam giac low-poly
- tong the phai giong `luxury car trailer`, khong giong model viewer demo

## Pham vi

Spec nay chi tap trung vao `hero dau trang chu` va moi lien ket cua no voi section 3D interactive ben duoi.

Trong pham vi:

- thiet ke trai nghiem `cinematic hero intro`
- xac dinh cach dung `3 model GLB` thanh mot world thong nhat
- xac dinh cau truc hero tren web
- xac dinh hanh vi autoplay, loop, scroll, fallback
- xac dinh cach section intro va section 3D interactive cung ton tai

Ngoai pham vi:

- khong mo ta chi tiet quy trinh dung video trong Blender/Unreal
- khong mo ta implementation code tung API video hoac rendering engine
- khong them am thanh trong phien ban dau
- khong them media controls cho hero intro
- khong thay doi pham vi trang `catalog` va `detail`

## Dau vao asset

Hero intro duoc dung tu 3 asset ma du an da co:

- `model/lambo_lp670.glb`
- `model/asian_themed_low_poly_night_city_buildings.glb`
- `model/low_poly_road_pack.glb`

Ba asset nay khong duoc dung nhu 3 object roi rac. Chung phai duoc art-direct lai thanh `mot cinematic world`:

- `lambo_lp670.glb` la nhan vat chinh
- `asian_themed_low_poly_night_city_buildings.glb` la lop thanh pho dem
- `low_poly_road_pack.glb` duoc dat lai, xoay lai, canh lai trong city de tao thanh tuyen chay hop ly

Dieu quan trong o version dau la `road` va `city` phai duoc gan vao nhau de khi camera cat canh rong, nguoi xem cam thay xe dang chay trong mot boi canh thong nhat thay vi tren cac asset xep canh nhau.

## Trai nghiem duoc chot

Homepage se co `2 lop trai nghiem lien tiep`:

### 1. Hero cinematic intro

Day la section dau tien cua homepage.

Dac diem:

- autoplay khi vao trang
- loop vo han
- khong co control media
- khong co orbit hay focus zone
- scroll trong trang khong lam no mat di hay reset cung
- text va CTA cua homepage duoc dat thanh overlay sang trong o tren video

Hero nay phai tao cam giac:

- opening sequence
- luxury automotive trailer
- thuong hieu dang san khau hoa mot sieu xe

No khong duoc tao cam giac:

- background video chung chung
- embedded player
- 3D viewer ky thuat

### 2. Interactive showroom section

Ngay sau hero intro la section 3D interactive.

No dong vai tro:

- cho phep user xoay xe
- giu focus zones
- cho phep kham pha chi tiet sau khi da duoc hook bang intro cinematic

Section nay la `the gioi thu hai` cua homepage: tu trailer chuyen sang showroom.

## Huong nghe thuat

Phong cach duoc chot la `hybrid luxury`.

Nguyen tac thi giac:

- canh rong cho phep city giu chat stylized thay vi co gang giau hoan toan
- canh can tap trung vao xe, anh sang, phan xa va motion de triet tieu cam giac asset game
- mau sac nghieng ve city dem, den, amber, gold, va white highlight tren than xe
- suong nhe, bloom tiet che, va depth mood duoc uu tien hon nhung hieu ung flashy

Huong nay cho phep du an tan dung bo asset hien co ma van giu duoc cam giac cao cap.

## Hero layout

Hero section khong nen giu bo cuc `text trai / khung 3D phai` nhu section interactive hien tai.

Thay vao do, hero cinematic duoc thiet ke theo huong:

- video loop chiem vai tro visual nen chinh
- text layer dat nhu mot overlay tinh te ben tren hero
- CTA van ro, de doc, nhung khong cat video thanh hai khoi 50/50

Muc tieu bo cuc:

- uu tien cam giac man hinh mo dau cua mot thuong hieu
- cho video du khong gian de “tho”
- giu do doc duoc cua headline, subcopy, va CTA

## Shot list vong loop

Mot vong intro co do dai muc tieu `15-20 giay`.

Vong nay duoc dung thanh chuoi shot co y do, co the lap lai muot:

### 1. Side tracking opener

- camera bay doc hong xe
- xe dang chay tren tuyen duong chinh trong city dem
- day la shot khoa mood cua toan bo intro

### 2. Wheel close-up

- cat can vao banh xe va than duoi
- nhan vao toc do, motion, va reflection

### 3. Front low-angle pass

- goc thap phia truoc
- xe lao qua camera hoac ap sat camera
- tao luc va cam giac “hero machine”

### 4. Wide city reveal

- may lui rong hon de thay boi canh city + road da duoc ghep thanh mot world
- day la shot cho phep chat stylized cua city xuat hien ro rang hon

### 5. Rear three-quarter shot

- goc sau cheo
- nhan silhouette xe va lop anh sang thanh pho luot qua

### 6. Hero beauty shot

- shot dep nhat cua xe o cuoi vong
- frame du sach de noi muot lai ve shot mo dau

Nguyen tac dung:

- canh can uu tien xe
- canh rong uu tien world-building
- nhip cat theo huong luxury trailer, khong can qua gap
- diem noi cuoi vong va dau vong phai tu nhien, tranh reset cung

## Kien truc ky thuat de xuat

Chon huong `hybrid production`.

Nghia la:

- `hero dau`: video cinematic render san
- `section tiep theo`: 3D interactive realtime bang Three.js

Khong chon huong render realtime toan bo hero dau vi:

- muc tieu uu tien la dep toi da
- intro 15-20 giay voi nhieu goc may, city, road, va car se qua nang neu co gang lam nhu phim trong runtime
- video render san cho kiem soat anh sang, camera, va nhiet do thi giac tot hon rat nhieu

## To chuc module tren web

Homepage nen tach ro thanh 2 module:

### 1. `hero-cinematic`

Trach nhiem:

- preload poster va video
- autoplay khi vao trang
- loop vo han
- quan ly overlay text / CTA / visual mask
- fallback ve poster neu video loi

### 2. `hero-3d`

Trach nhiem:

- render scene 3D interactive o section ben duoi
- giu cac focus zones da co
- giu hanh vi orbit / focus / reset

Module `hero-cinematic` khong nen biet logic noi bo cua `hero-3d`.
Module `hero-3d` cung khong nen phu thuoc vao video hero de khoi dong.

Hai module cung ton tai tren homepage nhung co vai tro ro rang va doc lap.

## Hanh vi autoplay, loop, scroll, tab

Yeu cau trai nghiem da chot:

- vao trang la hero tu dong phat
- hero loop vo han
- scroll trong trang khong lam hero dung chi vi user khong con o tren dinh trang
- khi user scroll len lai, hero van tiep tuc o vong loop hien tai thay vi reset tu dau

Rang buoc ky thuat can ghi ro:

- trinh duyet co the throttle hoac tam dung media/animation khi tab bi dua ra nen
- vi vay khong the dam bao hero “that su chay mai” khi user chuyen tab
- muc tieu thuc te la khi user quay lai tab, hero tiep tuc muot va khong tao cam giac vo trai nghiem

## Am thanh

Phien ban dau `khong co am thanh`.

Ly do:

- user uu tien phan hinh truoc
- tranh rao can autoplay co audio
- giu implementation gon va on dinh

Spec nen de mo kha nang mo rong ve sau:

- them mute/unmute
- them sound design loop
- them “enter with sound” neu can

Nhung cac kha nang tren khong nam trong pham vi version dau.

## Fallback strategy

Hero cinematic phai co `poster fallback` cao cap.

Khi video chua san sang hoac bi loi:

- van hien hero sang trong
- van giu overlay text va CTA
- khong de section dau thanh man hinh den rong hoac vo bo cuc

Fallback gom:

- `poster frame` xuat tu cung visual direction voi intro
- loading state gon nhe neu can
- neu video khong tai duoc thi poster tro thanh trang thai chinh

Section 3D interactive ben duoi phai van hoat dong doc lap ngay ca khi hero video fail.

## Performance stance

User da chot `uu tien dep toi da`.

Vi vay, spec nay uu tien:

- cinematic quality cua hero
- bo cuc hero an tuong
- shot list day chat trailer

Tuy nhien van can cac guardrails toi thieu:

- video can duoc encode web-friendly
- can co poster de tranh blank state
- khong de hero video la nguyen nhan lam vo toan bo homepage

Spec khong ep phai toi uu toi muc toi gian tren moi may yeu. Day la chu dich cua pham vi duoc chot.

## Anh huong toi homepage hien tai

Homepage hien tai dang co hero 3D interactive nam o section dau.

Sau thay doi, homepage se doi thanh:

1. `Section 1`: cinematic intro hero
2. `Section 2`: interactive 3D showroom
3. cac section con lai giu logic dong ke tiep

He qua giao dien:

- bo cuc hero dau can duoc thiet ke lai thanh visual-led
- section 3D interactive hien tai se duoc doi vai tro tu “opening hero” thanh “showroom kham pha”
- nav, CTA va storytelling can van thong nhat voi tone dark luxury da co

## Tieu chi dat

Tinh nang duoc xem la dat khi:

- homepage mo ra bang mot hero cinematic co chat phim ro rang
- hero dung du 3 asset trong mot world thong nhat
- `road` duoc gan hop ly vao `city`
- shot mo dau la side tracking va toan bo vong loop co nhieu goc nhu da chot
- loop dai khoang 15-20 giay va noi lai muot
- hero scroll ra khoi viewport nhung khong bi reset cung
- section interactive 3D ben duoi van ton tai ro rang va doc lap
- fallback poster van premium neu video fail
- tong the homepage manh hon ve storytelling va dinh vi thuong hieu so voi phien ban chi co 3D viewer o hero dau

## Khong lam trong version dau

De giu dung scope, version dau khong bao gom:

- am thanh
- media controls
- chang shot dong theo input nguoi dung
- dong bo timeline giua hero video va section 3D ben duoi
- thay doi trang `catalog` va `detail`
- tao them cac world hoac nhieu route city khac nhau
