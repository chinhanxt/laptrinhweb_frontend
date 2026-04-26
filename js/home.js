$(function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".hero-eyebrow, .hero-title, .hero-desc, .hero-ctas, .hero-stats", {
    y: 32,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: "power3.out"
  });

  gsap.from(".model-stage", {
    x: 48,
    opacity: 0,
    duration: 1.1,
    ease: "power3.out",
    delay: 0.3
  });

  gsap.from(".scroll-hint", {
    opacity: 0,
    duration: 0.6,
    delay: 1.5,
    ease: "power2.out"
  });

  gsap.utils.toArray(".brand-intro, .featured-section, .experience-section, .testimonials-section").forEach(function (section) {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: "top 80%"
      },
      y: 60,
      opacity: 0,
      duration: 0.9,
      ease: "power2.out"
    });
  });

  gsap.utils.toArray(".reveal").forEach(function (el) {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: "top 85%"
      },
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: "power2.out"
    });
  });
});
