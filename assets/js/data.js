/* ============================================================
   SHARED CAR DATA — T.R.Y.P Multi-Brand
   Single source of truth for all views
   ============================================================ */
var CARS_DATA = [
  {
    id: "aventador-lp670",
    name: "Aventador LP 670",
    brand: "Lamborghini",
    series: "v12",
    tagline: "Biểu tượng tốc độ tuyệt đối với động cơ V12 tự nhiên, mang đến âm thanh và sức mạnh thuần khiết.",
    specs: {
      hp: 789,
      engine: "V12",
      acceleration: "3.2s",
      topSpeed: "355 km/h",
      price: "26 tỷ VND"
    },
    images: {
      hero: "../img/aventador-hero.webp",
      gallery: [
        "../img/aventador-exterior.webp",
        "../img/aventador-interior.webp",
        "../img/aventador-rear.webp",
        "../img/aventador-engine.webp"
      ]
    },
    model3d: "../model/lambo_lp670.glb",
    modelConfig: {
      cameraOrbit: "325deg 78deg 105%",
      cameraTarget: "0m 0.3m 0m",
      fieldOfView: "28deg"
    }
  },
  {
    id: "huracan-sto",
    name: "Huracán STO",
    brand: "Lamborghini",
    series: "track",
    tagline: "Siêu xe đường đua hợp pháp với khí động học lấy cảm hứng từ xe đua Super Trofeo.",
    specs: {
      hp: 640,
      engine: "V10",
      acceleration: "3.0s",
      topSpeed: "310 km/h",
      price: "21 tỷ VND"
    },
    images: {
      hero: "../img/huracan-hero.webp",
      gallery: [
        "../img/huracan-exterior.webp",
        "../img/huracan-interior.webp",
        "../img/huracan-rear.webp"
      ]
    },
    model3d: null,
    modelConfig: null
  },
  {
    id: "revuelto",
    name: "Revuelto",
    brand: "Lamborghini",
    series: "hybrid",
    tagline: "Thế hệ tiếp theo của Lamborghini — kết hợp động cơ V12 và 3 mô-tơ điện cho công suất kỷ lục.",
    specs: {
      hp: 1001,
      engine: "Hybrid V12",
      acceleration: "2.5s",
      topSpeed: "350 km/h",
      price: "19 tỷ VND"
    },
    images: {
      hero: "../img/revuelto-hero.webp",
      gallery: [
        "../img/revuelto-exterior.webp",
        "../img/revuelto-interior.webp",
        "../img/revuelto-rear.webp"
      ]
    },
    model3d: null,
    modelConfig: null
  },
  {
    id: "sf90-stradale",
    name: "SF90 Stradale",
    brand: "Ferrari",
    series: "hybrid",
    tagline: "Siêu xe hybrid mạnh nhất của Ferrari với hệ thống plug-in hybrid 3 mô-tơ điện.",
    specs: {
      hp: 986,
      engine: "Hybrid V8",
      acceleration: "2.5s",
      topSpeed: "340 km/h",
      price: "32 tỷ VND"
    },
    images: {
      hero: "../img/sf90-hero.webp",
      gallery: [
        "../img/sf90-exterior.webp",
        "../img/sf90-interior.webp",
        "../img/sf90-rear.webp"
      ]
    },
    model3d: "../model/2019_ferrari_488_pista_spider.glb",
    modelConfig: {
      cameraOrbit: "325deg 78deg 105%",
      cameraTarget: "0m 0.3m 0m",
      fieldOfView: "28deg"
    }
  },
  {
    id: "roma",
    name: "Roma",
    brand: "Ferrari",
    series: "gt",
    tagline: "Grand Touring đỉnh cao — sự kết hợp hoàn hảo giữa hiệu suất và phong cách La Dolce Vita.",
    specs: {
      hp: 620,
      engine: "V8 Twin-Turbo",
      acceleration: "3.4s",
      topSpeed: "320 km/h",
      price: "22 tỷ VND"
    },
    images: {
      hero: "../img/roma-hero.webp",
      gallery: [
        "../img/roma-exterior.webp",
        "../img/roma-interior.webp",
        "../img/roma-rear.webp"
      ]
    },
    model3d: "../model/2020_ferrari_roma.glb",
    modelConfig: {
      cameraOrbit: "325deg 78deg 105%",
      cameraTarget: "0m 0.3m 0m",
      fieldOfView: "28deg"
    }
  },
  {
    id: "750s",
    name: "750S",
    brand: "McLaren",
    series: "super",
    tagline: "Siêu phẩm siêu nhẹ với cấu trúc carbon và hiệu suất vượt trội trên mọi cung đường.",
    specs: {
      hp: 750,
      engine: "V8 Twin-Turbo",
      acceleration: "2.8s",
      topSpeed: "332 km/h",
      price: "24 tỷ VND"
    },
    images: {
      hero: "../img/750s-hero.webp",
      gallery: [
        "../img/750s-exterior.webp",
        "../img/750s-interior.webp",
        "../img/750s-rear.webp"
      ]
    },
    model3d: null,
    modelConfig: null
  },
  {
    id: "911-gt3-rs",
    name: "911 GT3 RS",
    brand: "Porsche",
    series: "track",
    tagline: "Cỗ máy đường đua thuần chủng mang đẳng cấp motorsport lên từng cung đường phố.",
    specs: {
      hp: 525,
      engine: "Flat-6",
      acceleration: "3.2s",
      topSpeed: "296 km/h",
      price: "18 tỷ VND"
    },
    images: {
      hero: "../img/gt3rs-hero.webp",
      gallery: [
        "../img/gt3rs-exterior.webp",
        "../img/gt3rs-interior.webp",
        "../img/gt3rs-rear.webp"
      ]
    },
    model3d: null,
    modelConfig: null
  }
];

/* Helper: find car by ID */
function getCarById(id) {
  for (var i = 0; i < CARS_DATA.length; i++) {
    if (CARS_DATA[i].id === id) return CARS_DATA[i];
  }
  return null;
}

/* Helper: get unique brand list */
function getBrands() {
  var seen = {};
  var brands = [];
  for (var i = 0; i < CARS_DATA.length; i++) {
    var b = CARS_DATA[i].brand;
    if (!seen[b]) {
      seen[b] = true;
      brands.push(b);
    }
  }
  return brands;
}
