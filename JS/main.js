document.addEventListener("DOMContentLoaded", () => {
  const DEFAULT_IMG =
    "https://i.ibb.co/TqPyvvnR/1745995898533-removebg-preview.png";

  /* ================= MOBILE NAV ================= */

  const menuToggle = document.querySelector(".menu-toggle");
  const navContainer = document.querySelector(".nav-container");
  const navOverlay = document.getElementById("navOverlay");
  let scrollY = 0;

  function openNav() {
    scrollY = window.scrollY;
    navContainer.classList.add("is-active");
    navOverlay.classList.add("is-active");
    menuToggle.classList.add("is-active");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
  }

  function closeNav() {
    navContainer.classList.remove("is-active");
    navOverlay.classList.remove("is-active");
    menuToggle.classList.remove("is-active");
    document.body.style.position = "";
    document.body.style.top = "";
    window.scrollTo(0, scrollY);
  }

  if (menuToggle && navContainer && navOverlay) {
    menuToggle.addEventListener("click", () =>
      navContainer.classList.contains("is-active") ? closeNav() : openNav()
    );
    navOverlay.addEventListener("click", closeNav);
    document
      .querySelectorAll(".nav-item a")
      .forEach((a) => a.addEventListener("click", closeNav));
  }

  /* ================= LOGO SNAP BACK ================= */
  const heroModel = document.querySelector(".hero-image model-viewer");
  if (heroModel) {
    let resetTimeout;

    const startResetTimer = () => {
      clearTimeout(resetTimeout);
      // Wait 2.5 seconds before snapping back
      resetTimeout = setTimeout(() => {
        // model-viewer has built-in camera-smoothing/interpolation
        heroModel.cameraOrbit = '0deg 75deg 105%';
      }, 1000);
    };

    heroModel.addEventListener('pointerdown', () => {
      clearTimeout(resetTimeout);
    });

    heroModel.addEventListener('pointerup', startResetTimer);
    heroModel.addEventListener('touchend', startResetTimer);
  }
});
