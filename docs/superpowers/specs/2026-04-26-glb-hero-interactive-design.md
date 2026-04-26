# GLB Hero Interactive Design

## Muc tieu

Thay the giai phap `Sketchfab iframe` o hero trang chu bang mot model `GLB` duoc render truc tiep trong website, de tang quyen kiem soat ve camera, lighting, composition, motion, va trai nghiem tuong tac.

Muc tieu khong phai la lam mot 3D viewer ky thuat, ma la tao mot `cinematic showroom hero` co kha nang tuong tac, phu hop voi phong cach `dark luxury`.

## Pham vi

Spec nay chi tap trung vao `hero 3D trang chu`.

No khong thay the toan bo spec tong cho website, ma bo sung mot huong rieng cho phan hero:

- dung `GLB` thay cho iframe
- giu `1 index.html` cho toan bo website
- hero la mot scene 3D rieng trong homepage
- user co the xoay model
- user co the `double click` vao vung tren xe de focus vao bo phan do
- co fallback bang `poster frame` neu model khong tai duoc hoac qua nang

## Trai nghiem duoc chot

Hero di theo huong `cinematic motion shot` la chu dao, nhung van co tuong tac sau.

Trai nghiem mong muon:

1. Vao trang la thay mot opening shot dep, co chu dong, co nhac dieu dien anh
2. User co the drag de xoay xe nhe trong gioi han hop ly
3. User double click vao mot bo phan tren xe thi camera bay toi mot goc preset dep
4. Sau khi focus, giao dien hien caption / label nho de dien giai bo phan do
5. User co the reset tro lai view tong the

## Kien truc trai nghiem

Hero gom 4 lop:

### 1. 3D Stage

Noi render:

- model `GLB`
- camera
- lights
- shadow co kiem soat
- background / visual stage

### 2. Interaction Layer

Xu ly:

- drag de xoay model
- double click de raycast vao vung model
- map tu vung cham sang focus zone

### 3. Cinematic UI Layer

Chua:

- headline
- subheading
- CTA
- label nho cho scene
- caption khi focus bo phan

### 4. Fallback Layer

Neu `GLB` loi, qua nang, hoac load cham qua nguong chap nhan:

- hien `poster frame`
- giu nguyen text, CTA, layout, va mood luxury
- khong de hero vo hoac trong nhu bi hong

## Focus strategy

Chon huong `hybrid`.

Nghia la:

- user double click vao vung tren model
- he thong raycast de xac dinh khu vuc duoc chon
- camera khong bay tuy y toi diem hit tho
- thay vao do, moi vung se co `preset camera pose` rieng da duoc dan san cho dep

Muc tieu cua huong nay:

- giu cam giac tuong tac that
- dam bao camera luon ra duoc goc dep
- tranh tinh trang focus vao goc xau, qua sat, hoac mat bo cuc

## 4 focus zones cho version dau

Version dau chi ho tro `4 vung`.

### 1. Dau xe

- trigger gan den truoc / mui xe
- camera bay ra goc cheo truoc, hoi thap
- nhan vao front identity, light signature, va gia tri hung han

### 2. Mam / banh

- trigger gan banh truoc hoac sau
- camera ha thap hon, day gan vao cum mam va phanh
- nhan vao feel `performance machinery`

### 3. Cua / cabin

- trigger gan cua ben hoac kinh ben
- camera ra shot ngang, tam nhin gan mat nguoi
- nhan vao side profile va cam giac khoang lai

### 4. Duoi xe

- trigger gan den hau / can sau / ong xa
- camera lui ve sau va hoi lech
- nhan vao silhouette duoi, exhaust, va chat ket canh cinematic

## Stack ky thuat de xuat

- `Three.js` de render scene 3D
- `GLTFLoader` de nap model `GLB`
- `OrbitControls` hoac control tu gioi han de user xoay xe
- `Raycaster` de nhan double click vao model
- `GSAP` de tween camera, target, caption, va scene transition

## To chuc code de xuat

Website van giu cau truc mot entry point, nhung logic hero 3D duoc tach thanh mot unit rieng de tranh roi homepage.

### HTML

- `index.html`
  - chua container cho hero scene
  - chua text layer va CTA
  - chua fallback poster layer

### JS

- `js/home.js`
  - orchestration tong the cua homepage
  - goi hero 3D module
- `js/hero-3d.js`
  - tao scene
  - load GLB
  - setup camera / light
  - focus zones
  - raycast
  - drag / double click interactions
  - reset state
  - fallback logic

### CSS

- `css/home.css`
  - layout hero
  - luxury frame
  - overlay text
  - caption
  - loading / fallback visuals

## Interface noi bo de xuat

Module hero 3D nen expose mot interface gon:

- `initHeroScene()`
- `focusZone(zoneId)`
- `resetHeroCamera()`
- `showHeroFallback()`

Homepage khong nen biet chi tiet ben trong scene. No chi goi cac ham can thiet.

## Performance guardrails

De tranh du an bi day thanh mot bai toan engine 3D, version dau bi gioi han nhu sau:

- chi `1 model GLB`
- chi `1 hero scene`
- chi `4 focus zones`
- khong them configurator
- khong them color switching realtime
- khong them mo cua / co khi dong
- khong them shader phuc tap
- han che post-processing nang
- mobile co the giam hieu ung, giam shadow, hoac dung fallback som hon

## Fallback strategy

Fallback duoc chot la `poster frame cao cap`.

Yeu cau:

- co key visual tinh cua xe
- giu layout text trai / visual phai
- van sang, dep, premium
- khong de giao dien trong nhu "mat model"

Fallback se duoc kich hoat khi:

- model load fail
- thoi gian load vuot nguong cho phep
- thiet bi qua yeu theo rule da chot trong implementation

## Muc dich thiet ke

Giai phap nay phai tao ra cam giac:

- showroom trailer
- luxury stage
- cinematic ownership tease

No khong duoc tro thanh:

- viewer demo ky thuat
- playground xoay model vo huong
- configurator thuong mai day du

## Tieu chi dat

Hero 3D duoc xem la dat khi:

1. Khong con dung `Sketchfab iframe` lam giai phap chinh
2. Model `GLB` duoc render truc tiep trong hero
3. Hero van giu bo cuc sang trong va cinematic
4. User co the drag xoay model
5. User co the double click vao vung tren xe de focus
6. Co dung `4 focus zones` da chot
7. Camera focus theo `preset poses`, khong zoom tho vao diem hit
8. Co caption hoac label khi focus
9. Co cach reset ve view tong the
10. Co `poster frame fallback`
11. Hieu ung va performance van du on cho mot bai frontend showroom

## Ngoai pham vi

- nhieu model trong hero
- configurator mau son
- mo cua / animation bo phan
- hotspot 8+ diem
- AR / VR
- bo dieu khien 3D phuc tap nhu mot trinh xem san pham thuong mai hoan chinh
