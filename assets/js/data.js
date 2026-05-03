/* ============================================================
   SHARED CAR DATA — T.R.Y.P Multi-Brand
   Single source of truth for all views
   ============================================================ */
var APPROVED_CAR_IDS = [
  "murcielago",
  "bmw-3-0-csl-hommage",
  "ferrari-488-pista-spider",
  "ferrari-roma",
  "centenario-roadster",
  "centenario-lp770"
];

var CARS_DATA = [
  {
    id: "murcielago",
    brand: "Lamborghini",
    name: "Murciélago",
    subtitle: "LP 670-4 SuperVeloce",
    specs: {
      year: 2010,
      hp: 670,
      engine: "6.5L V12",
      acceleration: "3.2s",
      topSpeed: "342 km/h",
      price: "18 tỷ VND"
    },
    images: {
      hero: "../img/cars/murcielago/hero.webp",
      gallery: [
        "../img/cars/murcielago/hero.webp",
        "../img/cars/murcielago/front.webp",
        "../img/cars/murcielago/rear.webp",
        "../img/cars/murcielago/top.webp"
      ]
    },
    model3d: "../model/lambo_lp670.glb",
    modelConfig: {
      cameraOrbit: "320deg 72deg 74%",
      cameraTarget: "auto auto auto",
      fieldOfView: "24deg",
      modelScale: "1.2 1.2 1.2",
      exposure: "1.5"
    }
  },
  {
    id: "bmw-3-0-csl-hommage",
    brand: "BMW",
    name: "3.0 CSL Hommage",
    subtitle: "Concept 2015",
    specs: {
      year: 2015,
      hp: 365,
      engine: "3.0L I6 Twin-Turbo",
      acceleration: "4.3s",
      topSpeed: "250 km/h",
      price: "Concept only"
    },
    images: {
      hero: "../img/cars/bmw-3-0-csl-hommage/hero.webp",
      gallery: [
        "../img/cars/bmw-3-0-csl-hommage/hero.webp",
        "../img/cars/bmw-3-0-csl-hommage/front.webp",
        "../img/cars/bmw-3-0-csl-hommage/rear.webp",
        "../img/cars/bmw-3-0-csl-hommage/top.webp"
      ]
    },
    model3d: "../model/2015_bmw_3.0_csl_hommage_concept.glb",
    modelConfig: {
      cameraOrbit: "318deg 72deg 74%",
      cameraTarget: "0m 0.42m 0m",
      fieldOfView: "24deg",
      modelScale: "96 96 96",
      exposure: "1.45"
    }
  },
  {
    id: "ferrari-488-pista-spider",
    brand: "Ferrari",
    name: "488 Pista Spider",
    subtitle: "V8 Twin-Turbo",
    specs: {
      year: 2019,
      hp: 711,
      engine: "3.9L V8",
      acceleration: "2.85s",
      topSpeed: "340 km/h",
      price: "32 tỷ VND"
    },
    images: {
      hero: "../img/cars/ferrari-488-pista-spider/hero.webp",
      gallery: [
        "../img/cars/ferrari-488-pista-spider/hero.webp",
        "../img/cars/ferrari-488-pista-spider/front.webp",
        "../img/cars/ferrari-488-pista-spider/rear.webp",
        "../img/cars/ferrari-488-pista-spider/top.webp"
      ]
    },
    model3d: "../model/2019_ferrari_488_pista_spider.glb",
    modelConfig: {
      cameraOrbit: "320deg 72deg 74%",
      cameraTarget: "0m 0.42m 0m",
      fieldOfView: "24deg",
      modelScale: "104 104 104",
      exposure: "1.55"
    }
  },
  {
    id: "ferrari-roma",
    brand: "Ferrari",
    name: "Roma",
    subtitle: "Grand Touring Coupe",
    specs: {
      year: 2020,
      hp: 612,
      engine: "3.9L V8",
      acceleration: "3.4s",
      topSpeed: "320 km/h",
      price: "22 tỷ VND"
    },
    images: {
      hero: "../img/cars/ferrari-roma/hero.webp",
      gallery: [
        "../img/cars/ferrari-roma/hero.webp",
        "../img/cars/ferrari-roma/front.webp",
        "../img/cars/ferrari-roma/rear.webp",
        "../img/cars/ferrari-roma/top.webp"
      ]
    },
    model3d: "../model/2020_ferrari_roma.glb",
    modelConfig: {
      cameraOrbit: "320deg 72deg 74%",
      cameraTarget: "0m 0.42m 0m",
      fieldOfView: "24deg",
      modelScale: "103 103 103",
      exposure: "1.5"
    }
  },
  {
    id: "centenario-roadster",
    brand: "Lamborghini",
    name: "Centenario Roadster",
    subtitle: "Limited Edition V12",
    specs: {
      year: 2017,
      hp: 770,
      engine: "6.5L V12",
      acceleration: "2.9s",
      topSpeed: "350 km/h",
      price: "48 tỷ VND"
    },
    images: {
      hero: "../img/cars/centenario-roadster/hero.webp",
      gallery: [
        "../img/cars/centenario-roadster/hero.webp",
        "../img/cars/centenario-roadster/front.webp",
        "../img/cars/centenario-roadster/rear.webp",
        "../img/cars/centenario-roadster/top.webp"
      ]
    },
    model3d: "../model/lamborghini_centenario_roadster_sdc.glb",
    modelConfig: {
      cameraOrbit: "325deg 78deg 105%",
      cameraTarget: "0m 0.3m 0m",
      fieldOfView: "28deg",
      exposure: "1.0"
    }
  },
  {
    id: "centenario-lp770",
    brand: "Lamborghini",
    name: "Centenario LP-770",
    subtitle: "Interior Showcase",
    specs: {
      year: 2016,
      hp: 770,
      engine: "6.5L V12",
      acceleration: "2.8s",
      topSpeed: "350 km/h",
      price: "44 tỷ VND"
    },
    images: {
      hero: "../img/cars/centenario-lp770/hero.webp",
      gallery: [
        "../img/cars/centenario-lp770/hero.webp",
        "../img/cars/centenario-lp770/front.webp",
        "../img/cars/centenario-lp770/rear.webp",
        "../img/cars/centenario-lp770/top.webp"
      ]
    },
    model3d: "../model/lamborghini_centenario_lp-770_interior_sdc.glb",
    modelConfig: {
      cameraOrbit: "325deg 75deg 120%",
      cameraTarget: "0m 0.45m 0m",
      fieldOfView: "30deg",
      exposure: "1.0"
    }
  }
];

/* Helper: find car by ID */
function getCarById(id) {
  for (var i = 0; i < CARS_DATA.length; i++) {
    if (CARS_DATA[i].id === id) return CARS_DATA[i];
  }
  return null;
}

/* Helper: get approved six cars in the canonical order */
function getApprovedCars() {
  var approvedCars = [];

  for (var i = 0; i < APPROVED_CAR_IDS.length; i++) {
    var car = getCarById(APPROVED_CAR_IDS[i]);
    if (car) {
      approvedCars.push(car);
    }
  }

  return approvedCars;
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
