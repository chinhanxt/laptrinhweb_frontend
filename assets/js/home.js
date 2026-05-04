/* ============================================================
   HOME — GSAP Animations + 3D Hero Wiring
   ============================================================ */

(function () {
  var homeTriggers = [];
  var homeInitialized = false;

  function initHomeAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    homeTriggers.forEach(function (st) {
      st.kill();
    });
    homeTriggers = [];

    if (!homeInitialized) {
      homeInitialized = true;
    }

    gsap.utils.toArray(".showroom-stage-section, .brand-intro, .featured-section, .experience-section, .testimonials-section").forEach(function (section) {
      var tween = gsap.from(section, {
        scrollTrigger: {
          trigger: section,
          start: "top 80%"
        },
        y: 60,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out"
      });
      if (tween.scrollTrigger) {
        homeTriggers.push(tween.scrollTrigger);
      }
    });

    gsap.utils.toArray("main .reveal").forEach(function (el) {
      var tween = gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 85%"
        },
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out"
      });
      if (tween.scrollTrigger) {
        homeTriggers.push(tween.scrollTrigger);
      }
    });

    ScrollTrigger.refresh();
  }

  function renderHomepageBookingOptions() {
    var select = document.getElementById("bookingCar");
    if (!select || typeof getApprovedCars !== "function") {
      return;
    }

    var cars = getApprovedCars();
    var html = '<option value="">Chọn mẫu xe</option>';
    for (var i = 0; i < cars.length; i++) {
      html += '<option value="' + cars[i].id + '">' + cars[i].brand + " " + cars[i].name + "</option>";
    }
    select.innerHTML = html;
  }

  var lamboGalleryScheduled = false;
  var lamboGalleryStarted = false;

  function startLamboGalleryLoad() {
    if (lamboGalleryStarted || !window.LamboGallery || typeof window.LamboGallery.init !== "function") {
      return;
    }
    lamboGalleryStarted = true;
    window.LamboGallery.init();
  }

  function scheduleLamboGalleryLoad() {
    if (lamboGalleryScheduled || !window.LamboGallery) {
      return;
    }
    lamboGalleryScheduled = true;

    var gallery = document.getElementById("lamborghini-gallery");
    if (!gallery) {
      return;
    }

    if ("IntersectionObserver" in window) {
      var galleryObserver = new IntersectionObserver(function (entries) {
        if (entries[0] && entries[0].isIntersecting) {
          galleryObserver.disconnect();
          startLamboGalleryLoad();
        }
      }, { rootMargin: "1200px 0px", threshold: 0 });
      galleryObserver.observe(gallery);
    } else {
      window.setTimeout(startLamboGalleryLoad, 900);
    }

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(startLamboGalleryLoad, { timeout: 2200 });
    } else {
      window.setTimeout(startLamboGalleryLoad, 1400);
    }
  }

  $(function () {
    document.body.classList.add("app-is-booting");
    renderHomepageBookingOptions();

    var bootTasks = [];

    if (window.APEXIntro) {
      window.APEXIntro.init();
      if (typeof window.APEXIntro.whenReady === "function") {
        bootTasks.push(window.APEXIntro.whenReady());
      }
    }

    initHomeAnimations();

    var isMobile = window.innerWidth < 576;

    if (window.APEXHero3D) {
      if (isMobile) {
        window.APEXHero3D.showHeroFallback();
        $("#hero-loading").addClass("is-hidden");
        if (typeof window.APEXHero3D.whenReady === "function") {
          bootTasks.push(window.APEXHero3D.whenReady());
        }
      } else {
        var initialized = window.APEXHero3D.initHeroScene();
        if (initialized) {
          window.APEXHero3D.animate();
          if (typeof window.APEXHero3D.whenReady === "function") {
            bootTasks.push(window.APEXHero3D.whenReady());
          }
        } else {
          bootTasks.push(Promise.resolve(false));
        }
      }
    }

    if (window.LamboGallery && typeof window.LamboGallery.whenReady === "function") {
      window.LamboGallery.whenReady().catch(function () {});
    }

    if (!isMobile && window.APEXHero3D) {
      var heroShell = document.getElementById("hero-3d-shell");
      if (heroShell) {
        var heroObserver = new IntersectionObserver(function (entries) {
          var entry = entries[0];
          if (entry.isIntersecting) {
            window.APEXHero3D.resume();
          } else {
            window.APEXHero3D.pause();
          }
        }, { threshold: 0 });
        heroObserver.observe(heroShell);
      }
    }

    if (!bootTasks.length) {
      document.body.classList.remove("app-is-booting");
      scheduleLamboGalleryLoad();
      return;
    }

    Promise.all(bootTasks).finally(function () {
      function finishFirstScreenBoot() {
        if (window.location.hash) {
          window.requestAnimationFrame(function () {
            var target = document.querySelector(window.location.hash);
            if (target) target.scrollIntoView();
          });
        }

        scheduleLamboGalleryLoad();
      }

      if (window.APEXIntro && typeof window.APEXIntro.dismissLoading === "function") {
        window.APEXIntro.dismissLoading(finishFirstScreenBoot);
      } else {
        document.body.classList.remove("app-is-booting");
        finishFirstScreenBoot();
      }
    });
  });

  window.initHomeAnimations = initHomeAnimations;
})();
