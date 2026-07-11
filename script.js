(function () {
  "use strict";

  const STORAGE_KEY = "portfolio-theme";
  const header = document.getElementById("site-header");
  const navToggle = document.getElementById("nav-toggle");
  const themeToggle = document.getElementById("theme-toggle");
  const yearEl = document.getElementById("year");
  const scrollProgress = document.getElementById("scroll-progress");
  const projectsScroll = document.getElementById("projects-scroll");

  let lastScrollY = 0;
  let ticking = false;

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function setStoredTheme(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }

  function getPreferredTheme() {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "light" ? "切換為深色主題" : "切換為淺色主題"
      );
    }
  }

  function initTheme() {
    const stored = getStoredTheme();
    const theme =
      stored === "light" || stored === "dark" ? stored : getPreferredTheme();
    applyTheme(theme);
  }

  function toggleTheme() {
    const isLight =
      document.documentElement.getAttribute("data-theme") === "light";
    const next = isLight ? "dark" : "light";
    applyTheme(next);
    setStoredTheme(next);
  }

  function closeNav() {
    if (!header || !navToggle) return;
    header.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "開啟選單");
  }

  function openNav() {
    if (!header || !navToggle) return;
    header.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "關閉選單");
  }

  function toggleNav() {
    if (!header || !navToggle) return;
    if (header.classList.contains("is-open")) {
      closeNav();
    } else {
      openNav();
    }
  }

  function initNavToggle() {
    if (!navToggle || !header) return;
    navToggle.addEventListener("click", toggleNav);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 768px)").matches) {
        closeNav();
      }
    });
  }

  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]:not(.skip-link)');
    links.forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        closeNav();
        if (history.replaceState) {
          history.replaceState(null, "", id);
        }
      });
    });
  }

  function initReveal() {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const heroTitleLines = document.querySelectorAll(".hero__title-line");
    const revealElements = document.querySelectorAll(".reveal");

    if (reducedMotion) {
      heroTitleLines.forEach(function (el) {
        el.classList.add("is-visible");
      });
      revealElements.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    heroTitleLines.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add("is-visible");
      }, 200 + i * 150);
    });

    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initScrollProgress() {
    if (!scrollProgress) return;

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgress.style.width = progress + "%";
    }

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  function initHeaderScroll() {
    if (!header) return;

    function onScroll() {
      const scrollY = window.scrollY;

      if (scrollY > 60) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }

      if (scrollY > lastScrollY && scrollY > 300) {
        header.classList.add("is-hidden");
      } else {
        header.classList.remove("is-hidden");
      }

      lastScrollY = scrollY;
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(onScroll);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  function initCounters() {
    const counters = document.querySelectorAll(".stat-value[data-count]");
    if (!counters.length) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function animateCounter(el) {
      const target = parseInt(el.getAttribute("data-count"), 10);
      if (reducedMotion) {
        el.textContent = String(target);
        return;
      }

      const duration = 1200;
      const start = performance.now();

      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(target * eased));
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initProjectsDrag() {
    if (!projectsScroll) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    projectsScroll.addEventListener("mousedown", function (e) {
      isDown = true;
      projectsScroll.classList.add("is-dragging");
      startX = e.pageX - projectsScroll.offsetLeft;
      scrollLeft = projectsScroll.scrollLeft;
    });

    projectsScroll.addEventListener("mouseleave", function () {
      isDown = false;
      projectsScroll.classList.remove("is-dragging");
    });

    projectsScroll.addEventListener("mouseup", function () {
      isDown = false;
      projectsScroll.classList.remove("is-dragging");
    });

    projectsScroll.addEventListener("mousemove", function (e) {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - projectsScroll.offsetLeft;
      const walk = (x - startX) * 1.5;
      projectsScroll.scrollLeft = scrollLeft - walk;
    });
  }

  function initYear() {
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }
    initNavToggle();
    initSmoothScroll();
    initReveal();
    initScrollProgress();
    initHeaderScroll();
    initCounters();
    initProjectsDrag();
    initYear();
  });
})();
