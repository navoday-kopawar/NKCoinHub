document.addEventListener("DOMContentLoaded", () => {
  const DEFAULT_IMG =
    "https://i.ibb.co/TqPyvvnR/1745995898533-removebg-preview.png";

  /* ================= INVENTORY CARDS ================= */

  function renderCards(container, items) {
    if (!container) return;
    container.innerHTML = "";

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "nk-card";

      card.innerHTML = `
        <div class="coin-sides">
          <img src="${item.obverse?.image || DEFAULT_IMG}">
          <img src="${item.reverse?.image || DEFAULT_IMG}">
        </div>
        <div class="coin-title">
          ${item.reverse?.design || item.denomination || ""}
        </div>
      `;

      const popup = document.createElement("div");
      popup.className = "popup-bg";
      popup.style.display = "none";

      popup.innerHTML = `
        <div class="popup">
          <div class="popup-header">
            <div class="popup-title">${item.denomination || ""}</div>
            <button class="close-btn">X</button>
          </div>

          <div class="popup-grid">
            <div>
              <img src="${item.obverse?.image || DEFAULT_IMG}">
              <p><b>Design:</b> ${item.obverse?.design || "-"}</p>
              <p><b>Lettering:</b> ${item.obverse?.lettering || "-"}</p>
              <p><b>Mints:</b> ${item.obverse?.mints || "-"}</p>
            </div>
            <div>
              <img src="${item.reverse?.image || DEFAULT_IMG}">
              <p><b>Design:</b> ${item.reverse?.design || "-"}</p>
              <p><b>Lettering:</b> ${item.reverse?.lettering || "-"}</p>
              <p><b>Year:</b> ${item.reverse?.year || "-"}</p>
            </div>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        popup.style.display = "flex";
      });

      popup.addEventListener("click", (e) => {
        if (e.target === popup || e.target.classList.contains("close-btn")) {
          popup.style.display = "none";
        }
      });

      container.appendChild(card);
      document.body.appendChild(popup);
    });
  }

  /* ================= FILTER BUTTONS ================= */

  document.querySelectorAll(".filter-buttons").forEach((filters) => {
    const source = filters.dataset.source;
    const container = filters
      .closest(".table-section")
      ?.querySelector(".cards-area");

    const fullData = coinData[source] || [];
    renderCards(container, fullData);

    filters.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;

      filters
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const val = btn.dataset.value;
      const filtered =
        val === "all"
          ? fullData
          : fullData.filter((i) => String(i.denomination || "").includes(val));

      renderCards(container, filtered);
    });
  });

  /* ================= CATEGORY TABS ================= */

  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".category-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      document
        .querySelectorAll(".category-section")
        .forEach((sec) => (sec.style.display = "none"));

      const target = document.getElementById(btn.dataset.category);
      if (target) target.style.display = "block";
    });
  });

  /* ================= SEARCH ================= */

  const searchInput = document.querySelector(".search-input");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.toLowerCase();
      document.querySelectorAll(".nk-card").forEach((card) => {
        card.style.display = card.textContent.toLowerCase().includes(q)
          ? ""
          : "none";
      });
    });
  }

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

});
