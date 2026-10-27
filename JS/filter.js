document.addEventListener("DOMContentLoaded", async () => {

  /* ======================================================
     LOAD JSON FILES
  ====================================================== */

  let DATA = [];
  let ACTIVE_FILTERS = {};
  let SEARCH_QUERY = "";

  const cardsContainer = document.getElementById("cardsContainer");

  /* ================= FALLBACK IMAGES ================= */
  const FALLBACK_OBV = "https://i.ibb.co/bRR1YmHm/logo.png";
  const FALLBACK_REV = "https://i.ibb.co/RTzgyRy8/logo2.png";

  async function loadJSON(path) {
    const res = await fetch(path);
    return res.json();
  }

  async function loadAllData() {
    const [
      indianCoins,
      indianNotes,
      foreignCoins,
      foreignNotes,
      errorItems
    ] = await Promise.all([
      loadJSON("../JSON/indianCoins.json"),
      loadJSON("../JSON/indianNotes.json"),
      loadJSON("../JSON/foreignCoins.json"),
      loadJSON("../JSON/foreignNotes.json"),
      loadJSON("../JSON/errorItems.json")
    ]);

    return normalizeData(
      indianCoins,
      indianNotes,
      foreignCoins,
      foreignNotes,
      errorItems
    );
  }

  /* ======================================================
     NORMALIZATION (FLATTEN ALL STRUCTURES)
  ====================================================== */
  function normalizeData(ic, inotes, fc, fn, ei) {
    const list = [];

    /* Indian Coins */
    Object.values(ic.subTypes).forEach(type => {
      ["preDecimal", "decimal"].forEach(series => {
        if (type[series]) {
          type[series].items.forEach(item => {
            list.push({
              ...item,
              category: "Indian Coins",
              coinType: type.label.replace(" Coins", ""),
              series: type[series].label
            });
          });
        }
      });
    });

    /* Indian Notes */
    inotes.items.forEach(i =>
      list.push({ ...i, category: "Indian Notes" })
    );

    /* Foreign Coins */
    fc.items.forEach(i =>
      list.push({ ...i, category: "Foreign Coins" })
    );

    /* Foreign Notes */
    fn.items.forEach(i =>
      list.push({ ...i, category: "Foreign Notes" })
    );

    /* Error Coins / Notes */
    Object.values(ei.subTypes).forEach(g => {
      g.items.forEach(i =>
        list.push({ ...i, category: "Error Coins / Notes" })
      );
    });

    return list.map(i => ({
      ...i,
      searchText: JSON.stringify(i).toLowerCase()
    }));
  }

  /* ======================================================
     FILTER + SEARCH LOGIC
  ====================================================== */

  const searchInput = document.getElementById("searchInput");
  const overlay = document.getElementById("overlay");
  const indianCoinFilters = document.getElementById("indianCoinFilters");

  window.openFilter = () => overlay.classList.add("show");

  overlay.onclick = e => {
    if (e.target === overlay) overlay.classList.remove("show");
  };

  document.addEventListener("click", e => {
    if (e.target.classList.contains("chip")) {
      e.target.classList.toggle("active");
      updateSubFilters();
      collectFilters();
      filterAndRender();
    }
  });

  function updateSubFilters() {
    const cats = [...document.querySelectorAll(
      '[data-filter="category"] .chip.active'
    )].map(c => c.textContent);

    indianCoinFilters.classList.toggle(
      "hidden",
      !cats.includes("Indian Coins")
    );
  }

  function applyFilter() {
    collectFilters();
    filterAndRender();
    overlay.classList.remove("show");
  }
  window.applyFilter = applyFilter;

  function collectFilters() {
    ACTIVE_FILTERS = {};
    document.querySelectorAll(".chips").forEach(group => {
      const key = group.dataset.filter;
      const values = [...group.querySelectorAll(".chip.active")]
        .map(c => c.textContent);
      if (values.length) ACTIVE_FILTERS[key] = values;
    });
  }

  function filterAndRender() {
    const q = SEARCH_QUERY;

    const result = DATA.filter(item => {

      if (
        ACTIVE_FILTERS.category &&
        !ACTIVE_FILTERS.category.includes(item.category)
      ) return false;

      if (
        ACTIVE_FILTERS.coinType &&
        item.coinType &&
        !ACTIVE_FILTERS.coinType.includes(item.coinType)
      ) return false;

      if (
        ACTIVE_FILTERS.series &&
        item.series &&
        !ACTIVE_FILTERS.series.includes(item.series)
      ) return false;

      if (q && !item.searchText.includes(q)) return false;

      return true;
    });

    renderSections(result);
  }

  function resetFilter() {
    document.querySelectorAll(".chip")
      .forEach(c => c.classList.remove("active"));
    searchInput.value = "";
    SEARCH_QUERY = "";
    ACTIVE_FILTERS = {};
    indianCoinFilters.classList.add("hidden");
    renderSections(DATA);
  }
  window.resetFilter = resetFilter;

  /* ======================================================
     RENDER (COLLECTION STYLE)
  ====================================================== */
  function renderSections(items) {
    cardsContainer.innerHTML = "";

    const grouped = {};
    items.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    Object.entries(grouped).forEach(([category, items]) => {
      const section = document.createElement("div");
      section.className = "collection-section";
      section.innerHTML = `<h2>${category}</h2>`;

      const grid = document.createElement("div");
      grid.className = "items-grid";

      items.forEach(item => {
        const obv = item.design?.obverse?.image
          ? "../assets/" + item.design.obverse.image
          : FALLBACK_OBV;

        const rev = item.design?.reverse?.image
          ? "../assets/" + item.design.reverse.image
          : FALLBACK_REV;

        grid.innerHTML += `
          <div class="nk-card">
            <div class="coin-sides">
              <img src="${obv}" onerror="this.src='${FALLBACK_OBV}'">
              <img src="${rev}" onerror="this.src='${FALLBACK_REV}'">
            </div>
            <div class="card-title">${item.title}</div>
          </div>
        `;
      });

      section.appendChild(grid);
      cardsContainer.appendChild(section);
    });
  }

  /* ================= SEARCH INPUT ================= */
  searchInput.addEventListener("input", () => {
    SEARCH_QUERY = searchInput.value.toLowerCase();
    filterAndRender();
  });

  /* ================= MOBILE SEARCH TOGGLE ================= */
  const searchBox = document.getElementById("searchBox");
  const searchToggle = document.getElementById("searchToggle");

  searchToggle.addEventListener("click", () => {
    searchBox.classList.toggle("active");
    if (searchBox.classList.contains("active")) {
      searchInput.focus();
    }
  });

  /* ================= INIT ================= */
  loadAllData().then(data => {
    DATA = data;
    renderSections(DATA);
  });

});
