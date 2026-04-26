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
      gsap.from(".hero-eyebrow, .hero-title, .hero-desc, .hero-ctas, .hero-stats", {
        y: 32,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out"
      });

      gsap.from(".hero-cinematic__media", {
        scale: 1.04,
        opacity: 0,
        duration: 1.4,
        ease: "power2.out"
      });

      gsap.from(".scroll-hint", {
        opacity: 0,
        duration: 0.6,
        delay: 1.4,
        ease: "power2.out"
      });

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

    gsap.utils.toArray("#view-home .reveal").forEach(function (el) {
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
    initHomeAnimations();

    if (window.APEXCinematicHero) {
      window.APEXCinematicHero.init();
    }

    if (window.APEXHero3D) {
      var prefersFallback = window.innerWidth < 576;

      if (prefersFallback) {
        window.APEXHero3D.showHeroFallback();
        $("#hero-loading").addClass("is-hidden");
      } else {
        var initialized = window.APEXHero3D.initHeroScene();
        if (initialized) {
          window.APEXHero3D.animate();
        }
      }

    }
  });

  window.initHomeAnimations = initHomeAnimations;
})();
