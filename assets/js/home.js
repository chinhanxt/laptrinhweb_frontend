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

  $(function () {
    document.body.classList.add("app-is-booting");

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

    if (window.LamboGallery) {
      bootTasks.push(window.LamboGallery.whenReady());

      if (!isMobile) {
        window.LamboGallery.init();

        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.create({
          trigger: "#lamborghini-gallery",
          start: "top 80%",
          end: "bottom 20%",
          onEnter: function () {
            if (window.APEXHero3D && typeof window.APEXHero3D.dispose === "function") {
              window.APEXHero3D.dispose();
            }
          },
          onLeaveBack: function () {
            if (window.LamboGallery && typeof window.LamboGallery.dispose === "function") {
              window.LamboGallery.dispose();
            }
            if (window.APEXHero3D && typeof window.APEXHero3D.reinit === "function") {
              window.APEXHero3D.reinit();
            }
          },
          onLeave: function () {
            if (window.LamboGallery && typeof window.LamboGallery.dispose === "function") {
              window.LamboGallery.dispose();
            }
          },
          onEnterBack: function () {
            if (window.LamboGallery && typeof window.LamboGallery.reinit === "function") {
              window.LamboGallery.reinit();
            }
          }
        });
      } else {
        window.LamboGallery.init();
      }
    }

    if (!bootTasks.length) {
      document.body.classList.remove("app-is-booting");
      return;
    }

    Promise.all(bootTasks).finally(function () {
      if (window.APEXIntro && typeof window.APEXIntro.dismissLoading === "function") {
        window.APEXIntro.dismissLoading();
      } else {
        document.body.classList.remove("app-is-booting");
      }


      if (window.location.hash) {
        window.requestAnimationFrame(function () {
          var target = document.querySelector(window.location.hash);
          if (target) target.scrollIntoView();
        });
      }
    });
  });

  window.initHomeAnimations = initHomeAnimations;
})();
