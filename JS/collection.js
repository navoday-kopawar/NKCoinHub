const FALLBACK_OBV = "https://i.ibb.co/bRR1YmHm/logo.png";
const FALLBACK_REV = "https://i.ibb.co/RTzgyRy8/logo2.png";

let ALL = [],
  FILTER = {},
  SEARCH = "";

/* UI */
function toggleFilter() {
  overlay.classList.add("show");
}
function closeFilter(e) {
  if (e.target.id === "overlay") overlay.classList.remove("show");
}
function toggleDropdown(el) {
  el.parentElement.classList.toggle("open");
}

// Ensure search input is referenced properly
const searchInputElement = document.getElementById("searchInput");
const resultsCountElement = document.getElementById("resultsCount");

if (searchInputElement) {
  searchInputElement.oninput = () => {
    SEARCH = searchInputElement.value.toLowerCase();
    render();
  };
}

/* APPLY / CLEAR */
function apply() {
  FILTER = {
    cat: [...document.querySelectorAll(".cat:checked")].map((c) => c.value),
    coinType: [...document.querySelectorAll(".coinType:checked")].map((c) => c.value),
    series: [...document.querySelectorAll(".series:checked")].map((c) => c.value),
    den: [...document.querySelectorAll(".den:checked")].map((c) => c.value),
    country: [...document.querySelectorAll(".country:checked")].map((c) => c.value),
  };

  overlay.classList.remove("show");
  updateFilterCounters();
  renderActiveFilters();
  render();
}

function clearAll() {
  document.querySelectorAll("input[type=checkbox]").forEach((c) => (c.checked = false));
  FILTER = {};

  updateCoinTypeAvailability();
  updateSeriesAvailability();
  updateCountryAvailability();
  updateDenominationAvailability();
  updateFilterCounters();
  renderActiveFilters();
  render();
}

/* FILTER COUNTERS — Update sidebar badge counts */
function updateFilterCounters() {
  const counts = [
    { id: "catCount", sel: ".cat:checked" },
    { id: "coinTypeCount", sel: ".coinType:checked" },
    { id: "seriesCount", sel: ".series:checked" },
    { id: "denCount", sel: ".den:checked" },
    { id: "countryCount", sel: ".country:checked" },
  ];

  let totalActive = 0;

  counts.forEach(({ id, sel }) => {
    const el = document.getElementById(id);
    const n = document.querySelectorAll(sel).length;
    totalActive += n;
    if (el) {
      el.textContent = n > 0 ? n : "";
      el.style.display = n > 0 ? "inline-flex" : "none";
    }
    // Highlight the parent filter-group when active
    if (el) {
      const group = el.closest(".filter-group");
      if (group) group.classList.toggle("has-active", n > 0);
    }
  });

  // Update the Filter button badge
  const badge = document.getElementById("filterBadge");
  if (badge) {
    badge.textContent = totalActive;
    badge.style.display = totalActive > 0 ? "inline-flex" : "none";
  }
}

/* ACTIVE FILTER CHIPS */
function renderActiveFilters() {
  const container = document.getElementById("activeFilters");
  if (!container) return;

  const labelMap = { cat: "Category", coinType: "Type", series: "Series", den: "Denom.", country: "Country" };
  const chips = [];

  Object.entries(FILTER).forEach(([key, values]) => {
    (values || []).forEach((val) => {
      chips.push({ key, val, label: labelMap[key] || key });
    });
  });

  if (chips.length === 0) {
    container.innerHTML = "";
    container.style.display = "none";
    return;
  }

  container.style.display = "flex";
  container.innerHTML = chips.map(({ key, val, label }) =>
    `<span class="filter-chip" onclick="removeChip('${key}','${CSS.escape(val)}',' ${val}')">` +
    `<span class="chip-label">${label}:</span> ${val} <button class="chip-remove" title="Remove filter">✕</button></span>`
  ).join("") +
    (chips.length > 1
      ? `<button class="chip-clear-all" onclick="clearAll()">Clear all</button>`
      : "");
}

function removeChip(key, escapedVal, rawVal) {
  // Uncheck the matching checkbox
  document.querySelectorAll("." + key).forEach((cb) => {
    if (cb.value === rawVal.trim()) cb.checked = false;
  });

  // Remove from FILTER
  if (FILTER[key]) {
    FILTER[key] = FILTER[key].filter((v) => v !== rawVal.trim());
    if (FILTER[key].length === 0) delete FILTER[key];
  }

  // Dynamic availability updates when removing a category chip
  if (key === "cat") {
    updateCoinTypeAvailability();
    updateSeriesAvailability();
    updateCountryAvailability();
    updateDenominationAvailability();
  }

  updateFilterCounters();
  renderActiveFilters();
  render();
}
function updateCoinTypeAvailability() {
  const indianCoinsChecked = [
    ...document.querySelectorAll(".cat:checked"),
  ].some((c) => c.value === "Indian Coins");

  const coinTypeBox = document.getElementById("coinTypeBox");

  if (!indianCoinsChecked) {
    // Disable Coin Type
    coinTypeBox.classList.add("disabled");
    coinTypeBox.classList.remove("open");
    // Clear selected Coin Type options
    document.querySelectorAll(".coinType").forEach((c) => (c.checked = false));

    // Remove Coin Type filter if exists
    if (FILTER.coinType) delete FILTER.coinType;
  } else {
    // Enable Coin Type
    coinTypeBox.classList.remove("disabled");
  }
}

document.querySelectorAll(".cat").forEach((cb) => {
  cb.addEventListener("change", () => {
    updateCoinTypeAvailability();
    updateSeriesAvailability();
    updateCountryAvailability();
    updateDenominationAvailability();
  });
});

function updateSeriesAvailability() {
  const indianCoinsChecked = [
    ...document.querySelectorAll(".cat:checked"),
  ].some((c) => c.value === "Indian Coins");

  const seriesBox = document.getElementById("seriesBox");

  if (!indianCoinsChecked) {
    seriesBox.classList.add("disabled");
    seriesBox.classList.remove("open");
    document.querySelectorAll(".series").forEach((c) => (c.checked = false));
    if (FILTER.series) delete FILTER.series;
  } else {
    seriesBox.classList.remove("disabled");
  }
}

function updateCountryAvailability() {
  const foreignSelected = [...document.querySelectorAll(".cat:checked")].some(
    (c) => c.value === "Foreign Coins" || c.value === "Foreign Notes",
  );

  const countryBox = document.getElementById("countryBox");

  if (!foreignSelected) {
    countryBox.classList.add("disabled");
    countryBox.classList.remove("open");
    document.querySelectorAll(".country").forEach((c) => (c.checked = false));
    if (FILTER.country) delete FILTER.country;
  } else {
    countryBox.classList.remove("disabled");
  }
}
function updateDenominationAvailability() {
  const cats = [...document.querySelectorAll(".cat:checked")].map(
    (c) => c.value,
  );

  const hasIndianCoins = cats.includes("Indian Coins");
  const hasIndianNotes = cats.includes("Indian Notes");

  const denBox = document.getElementById("denBox");
  const denOptions = document.getElementById("denOptions");

  // If neither Indian Coins nor Indian Notes selected → disable
  if (!hasIndianCoins && !hasIndianNotes) {
    denBox.classList.add("disabled");
    denBox.classList.remove("open");
    // Clear selections
    document.querySelectorAll(".den").forEach((c) => (c.checked = false));
    if (FILTER.den) delete FILTER.den;

    return;
  }

  // Enable denomination
  denBox.classList.remove("disabled");

  // Build denomination list dynamically
  let denominations = [];

  if (hasIndianCoins) {
    denominations.push("Anna", "Paisa", "₹1", "₹2", "₹5", "₹10", "₹20");
  }

  if (hasIndianNotes) {
    denominations.push(
      "₹1",
      "₹2",
      "₹5",
      "₹10",
      "₹20",
      "₹50",
      "₹100",
      "₹200",
      "₹500",
      "₹2000",
    );
  }

  // Remove duplicates
  denominations = [...new Set(denominations)];

  // Render checkboxes
  denOptions.innerHTML = denominations
    .map(
      (d) => `
      <label>
        <input type="checkbox" class="den" value="${d}"> ${d}
      </label>
    `,
    )
    .join("");
}

/* LOAD DATA */
async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error("Failed to load " + path);
    return await res.json();
  } catch (err) {
    console.error(err);
    return {};
  }
}

(async () => {
  const [ic, inotes, fc, fn, ei] = await Promise.all([
    loadJSON("../JSON/indianCoins.json"),
    loadJSON("../JSON/indianNotes.json"),
    loadJSON("../JSON/foreignCoins.json"),
    loadJSON("../JSON/foreignNotes.json"),
    loadJSON("../JSON/errorItems.json"),
  ]);

  Object.values(ic.subTypes).forEach((t) => {
    ["preDecimal", "decimal"].forEach((s) => {
      t[s]?.items?.forEach((i) =>
        ALL.push({
          ...i,
          category: "Indian Coins",
          coinType: t.label,
          series: t[s].label,
          country: "India",
          text: JSON.stringify(i).toLowerCase(),
        }),
      );
    });
  });

  inotes.items.forEach((i) =>
    ALL.push({
      ...i,
      category: "Indian Notes",
      country: "India",
      text: JSON.stringify(i).toLowerCase(),
    }),
  );

  fc.items.forEach((i) =>
    ALL.push({
      ...i,
      category: "Foreign Coins",
      country: i.countryOfIssue || i.country || i.issuingCountry || "",
      text: JSON.stringify(i).toLowerCase(),
    }),
  );

  fn.items.forEach((i) =>
    ALL.push({
      ...i,
      category: "Foreign Notes",
      country: i.countryOfIssue || i.country || i.issuingCountry || "",
      text: JSON.stringify(i).toLowerCase(),
    }),
  );

  Object.values(ei.subTypes).forEach((g) => {
    g.items.forEach((i) =>
      ALL.push({
        ...i,
        category: "Error Coins / Notes",
        itemType: i.itemType,
        country: "India",
        text: JSON.stringify(i).toLowerCase(),
      }),
    );
  });

  /* Build country list */
  const countries = [
    ...new Set(
      ALL.filter(
        (i) => i.category === "Foreign Coins" || i.category === "Foreign Notes",
      )
        .map((i) => i.country)
        .filter(Boolean),
    ),
  ].sort();

  countryOptions.innerHTML = countries
    .map(
      (c) =>
        `<label><input type="checkbox" class="country" value="${c}"> ${c}</label>`,
    )
    .join("");
  updateCoinTypeAvailability();
  updateSeriesAvailability();
  updateCountryAvailability();
  updateDenominationAvailability();
  render();
})();

/* RENDER */
function render() {
  const out = ALL.filter((i) => {
    if (FILTER.cat?.length && !FILTER.cat.includes(i.category)) return false;
    if (FILTER.coinType?.length && !FILTER.coinType.includes(i.coinType))
      return false;
    if (FILTER.series?.length && !FILTER.series.includes(i.series))
      return false;
    if (FILTER.den?.length) {
      const d = (i.denomination || "").toLowerCase();
      if (!FILTER.den.some((v) => d.includes(v.toLowerCase()))) return false;
    }
    if (FILTER.country?.length && !FILTER.country.includes(i.country))
      return false;
    if (SEARCH && !i.text.includes(SEARCH)) return false;
    return true;
  });

  // Calculate results count
  const totalItems = out.length;
  if (resultsCountElement) {
    resultsCountElement.innerText = `Showing ${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
  }

  cards.innerHTML = "";
  const g = {};
  out.forEach((i) => (g[i.category] ??= []).push(i));

  Object.entries(g).forEach(([cat, list]) => {
    const s = document.createElement("div");
    s.className = "section";
    s.innerHTML = `<h3>${cat}</h3>`;

    let hasCoins = false;
    let hasNotes = false;

    const coinGrid = document.createElement("div");
    coinGrid.className = "grid coins-grid";

    const noteGrid = document.createElement("div");
    noteGrid.className = "grid notes-grid";

    let coinHTML = "";
    let noteHTML = "";

    list.forEach((i) => {
      const obv = i.design?.obverse?.image || FALLBACK_OBV;
      const rev = i.design?.reverse?.image || FALLBACK_REV;

      const isCoin = i.itemType === "coin";

      const den = i.denomination ? `<div class="denomination-badge"><span>${i.denomination}</span></div>` : "";
      const rawTitle = (i.title || "").trim();
      const displayTitle = (rawTitle && rawTitle !== "-")
        ? rawTitle
        : [i.denomination, i.year].filter(Boolean).join(" · ") || "Unnamed Coin";

      if (isCoin) {
        coinHTML += `
        <div class="card coin-card" onclick="openItemModal(ALL[${ALL.indexOf(i)}])">
          <!-- Corner flourishes -->
          <div class="card-corner card-corner--tl">
            <svg class="corner-svg" viewBox="0 0 40 40" fill="none" stroke="var(--gold-main)" stroke-width="1.2">
              <path d="M 4,4 L 36,4 M 4,4 L 4,36" stroke-width="0.5" opacity="0.5"/>
              <path d="M 4,14 C 4,8 8,4 14,4 C 20,4 24,8 24,12 C 24,16 20,18 17,16 C 14,14 15,10 18,10 C 20,10 21,12 20,13" />
              <path d="M 14,4 C 8,4 4,8 4,14 C 4,20 8,24 12,24 C 16,24 18,20 16,17 C 14,14 10,15 10,18 C 10,20 12,21 13,20" />
              <path d="M 4,4 L 16,16 C 18,18 20,18 22,16 C 24,14 24,12 22,10 L 10,22" />
              <circle cx="8" cy="8" r="1.5" fill="var(--gold-main)"/>
              <circle cx="28" cy="4" r="1" fill="var(--gold-main)"/>
              <circle cx="4" cy="28" r="1" fill="var(--gold-main)"/>
            </svg>
          </div>
          <div class="card-corner card-corner--tr">
            <svg class="corner-svg" viewBox="0 0 40 40" fill="none" stroke="var(--gold-main)" stroke-width="1.2" style="transform: scaleX(-1);">
              <path d="M 4,4 L 36,4 M 4,4 L 4,36" stroke-width="0.5" opacity="0.5"/>
              <path d="M 4,14 C 4,8 8,4 14,4 C 20,4 24,8 24,12 C 24,16 20,18 17,16 C 14,14 15,10 18,10 C 20,10 21,12 20,13" />
              <path d="M 14,4 C 8,4 4,8 4,14 C 4,20 8,24 12,24 C 16,24 18,20 16,17 C 14,14 10,15 10,18 C 10,20 12,21 13,20" />
              <path d="M 4,4 L 16,16 C 18,18 20,18 22,16 C 24,14 24,12 22,10 L 10,22" />
              <circle cx="8" cy="8" r="1.5" fill="var(--gold-main)"/>
              <circle cx="28" cy="4" r="1" fill="var(--gold-main)"/>
              <circle cx="4" cy="28" r="1" fill="var(--gold-main)"/>
            </svg>
          </div>
          <div class="card-corner card-corner--bl">
            <svg class="corner-svg" viewBox="0 0 40 40" fill="none" stroke="var(--gold-main)" stroke-width="1.2" style="transform: scaleY(-1);">
              <path d="M 4,4 L 36,4 M 4,4 L 4,36" stroke-width="0.5" opacity="0.5"/>
              <path d="M 4,14 C 4,8 8,4 14,4 C 20,4 24,8 24,12 C 24,16 20,18 17,16 C 14,14 15,10 18,10 C 20,10 21,12 20,13" />
              <path d="M 14,4 C 8,4 4,8 4,14 C 4,20 8,24 12,24 C 16,24 18,20 16,17 C 14,14 10,15 10,18 C 10,20 12,21 13,20" />
              <path d="M 4,4 L 16,16 C 18,18 20,18 22,16 C 24,14 24,12 22,10 L 10,22" />
              <circle cx="8" cy="8" r="1.5" fill="var(--gold-main)"/>
              <circle cx="28" cy="4" r="1" fill="var(--gold-main)"/>
              <circle cx="4" cy="28" r="1" fill="var(--gold-main)"/>
            </svg>
          </div>
          <div class="card-corner card-corner--br">
            <svg class="corner-svg" viewBox="0 0 40 40" fill="none" stroke="var(--gold-main)" stroke-width="1.2" style="transform: scale(-1);">
              <path d="M 4,4 L 36,4 M 4,4 L 4,36" stroke-width="0.5" opacity="0.5"/>
              <path d="M 4,14 C 4,8 8,4 14,4 C 20,4 24,8 24,12 C 24,16 20,18 17,16 C 14,14 15,10 18,10 C 20,10 21,12 20,13" />
              <path d="M 14,4 C 8,4 4,8 4,14 C 4,20 8,24 12,24 C 16,24 18,20 16,17 C 14,14 10,15 10,18 C 10,20 12,21 13,20" />
              <path d="M 4,4 L 16,16 C 18,18 20,18 22,16 C 24,14 24,12 22,10 L 10,22" />
              <circle cx="8" cy="8" r="1.5" fill="var(--gold-main)"/>
              <circle cx="28" cy="4" r="1" fill="var(--gold-main)"/>
              <circle cx="4" cy="28" r="1" fill="var(--gold-main)"/>
            </svg>
          </div>
          <!-- Crown Header Section -->
          <div class="card-crown-container">
            <div class="crown-line crown-line-left"></div>
            <i class="fa-solid fa-crown card-crown"></i>
            <div class="crown-line crown-line-right"></div>
          </div>
          <!-- Title -->
          <div class="card-header">
            <div class="title">${displayTitle}</div>
          </div>
          <!-- Ornate divider -->
          <div class="card-divider-container">
            <div class="divider-line divider-line-left"></div>
            <img class="divider-ornament" src="../assets/logos/goldenlogo.png" alt="NKCoinHub Logo">
            <div class="divider-line divider-line-right"></div>
          </div>
          <!-- Images -->
          <div class="card-main">
            <div class="sides">
              <div class="side-wrapper">
                <img src="${obv}" onerror="this.src='${FALLBACK_OBV}'">
                <div class="side-label">Obverse</div>
              </div>
              <div class="sides-divider"></div>
              <div class="side-wrapper">
                <img src="${rev}" onerror="this.src='${FALLBACK_REV}'">
                <div class="side-label">Reverse</div>
              </div>
            </div>
          </div>
        </div>`;
      } else {
        noteHTML += `
        <div class="card note-card" onclick="openItemModal(ALL[${ALL.indexOf(i)}])">
          <!-- Corner flourishes -->
          <div class="card-corner card-corner--tl">
            <svg class="corner-svg" viewBox="0 0 40 40" fill="none" stroke="var(--gold-main)" stroke-width="1.2">
              <path d="M 4,4 L 36,4 M 4,4 L 4,36" stroke-width="0.5" opacity="0.5"/>
              <path d="M 4,14 C 4,8 8,4 14,4 C 20,4 24,8 24,12 C 24,16 20,18 17,16 C 14,14 15,10 18,10 C 20,10 21,12 20,13" />
              <path d="M 14,4 C 8,4 4,8 4,14 C 4,20 8,24 12,24 C 16,24 18,20 16,17 C 14,14 10,15 10,18 C 10,20 12,21 13,20" />
              <path d="M 4,4 L 16,16 C 18,18 20,18 22,16 C 24,14 24,12 22,10 L 10,22" />
              <circle cx="8" cy="8" r="1.5" fill="var(--gold-main)"/>
              <circle cx="28" cy="4" r="1" fill="var(--gold-main)"/>
              <circle cx="4" cy="28" r="1" fill="var(--gold-main)"/>
            </svg>
          </div>
          <div class="card-corner card-corner--tr">
            <svg class="corner-svg" viewBox="0 0 40 40" fill="none" stroke="var(--gold-main)" stroke-width="1.2" style="transform: scaleX(-1);">
              <path d="M 4,4 L 36,4 M 4,4 L 4,36" stroke-width="0.5" opacity="0.5"/>
              <path d="M 4,14 C 4,8 8,4 14,4 C 20,4 24,8 24,12 C 24,16 20,18 17,16 C 14,14 15,10 18,10 C 20,10 21,12 20,13" />
              <path d="M 14,4 C 8,4 4,8 4,14 C 4,20 8,24 12,24 C 16,24 18,20 16,17 C 14,14 10,15 10,18 C 10,20 12,21 13,20" />
              <path d="M 4,4 L 16,16 C 18,18 20,18 22,16 C 24,14 24,12 22,10 L 10,22" />
              <circle cx="8" cy="8" r="1.5" fill="var(--gold-main)"/>
              <circle cx="28" cy="4" r="1" fill="var(--gold-main)"/>
              <circle cx="4" cy="28" r="1" fill="var(--gold-main)"/>
            </svg>
          </div>
          <div class="card-corner card-corner--bl">
            <svg class="corner-svg" viewBox="0 0 40 40" fill="none" stroke="var(--gold-main)" stroke-width="1.2" style="transform: scaleY(-1);">
              <path d="M 4,4 L 36,4 M 4,4 L 4,36" stroke-width="0.5" opacity="0.5"/>
              <path d="M 4,14 C 4,8 8,4 14,4 C 20,4 24,8 24,12 C 24,16 20,18 17,16 C 14,14 15,10 18,10 C 20,10 21,12 20,13" />
              <path d="M 14,4 C 8,4 4,8 4,14 C 4,20 8,24 12,24 C 16,24 18,20 16,17 C 14,14 10,15 10,18 C 10,20 12,21 13,20" />
              <path d="M 4,4 L 16,16 C 18,18 20,18 22,16 C 24,14 24,12 22,10 L 10,22" />
              <circle cx="8" cy="8" r="1.5" fill="var(--gold-main)"/>
              <circle cx="28" cy="4" r="1" fill="var(--gold-main)"/>
              <circle cx="4" cy="28" r="1" fill="var(--gold-main)"/>
            </svg>
          </div>
          <div class="card-corner card-corner--br">
            <svg class="corner-svg" viewBox="0 0 40 40" fill="none" stroke="var(--gold-main)" stroke-width="1.2" style="transform: scale(-1);">
              <path d="M 4,4 L 36,4 M 4,4 L 4,36" stroke-width="0.5" opacity="0.5"/>
              <path d="M 4,14 C 4,8 8,4 14,4 C 20,4 24,8 24,12 C 24,16 20,18 17,16 C 14,14 15,10 18,10 C 20,10 21,12 20,13" />
              <path d="M 14,4 C 8,4 4,8 4,14 C 4,20 8,24 12,24 C 16,24 18,20 16,17 C 14,14 10,15 10,18 C 10,20 12,21 13,20" />
              <path d="M 4,4 L 16,16 C 18,18 20,18 22,16 C 24,14 24,12 22,10 L 10,22" />
              <circle cx="8" cy="8" r="1.5" fill="var(--gold-main)"/>
              <circle cx="28" cy="4" r="1" fill="var(--gold-main)"/>
              <circle cx="4" cy="28" r="1" fill="var(--gold-main)"/>
            </svg>
          </div>
          <!-- Crown Header Section -->
          <div class="card-crown-container">
            <div class="crown-line crown-line-left"></div>
            <i class="fa-solid fa-crown card-crown"></i>
            <div class="crown-line crown-line-right"></div>
          </div>
          <!-- Title -->
          <div class="card-header">
            <div class="title">${displayTitle}</div>
          </div>
          <!-- Ornate divider -->
          <div class="card-divider-container">
            <div class="divider-line divider-line-left"></div>
            <img class="divider-ornament" src="../assets/logos/goldenlogo.png" alt="NKCoinHub Logo">
            <div class="divider-line divider-line-right"></div>
          </div>
          <!-- Images -->
          <div class="card-main">
            <div class="note-sides">
              <img src="${obv}" onerror="this.src='${FALLBACK_OBV}'">
              <img src="${rev}" onerror="this.src='${FALLBACK_REV}'">
            </div>
          </div>
        </div>`;
      }
    });

    // Append grids only if they have data
    // ✅ Special handling ONLY for Error section
    if (cat === "Error Coins / Notes") {

      if (coinHTML) {
        const coinTitle = document.createElement("h4");
        coinTitle.className = "sub-heading";
        coinTitle.innerText = "Error Coins";

        coinGrid.innerHTML = coinHTML;

        s.appendChild(coinTitle);
        s.appendChild(coinGrid);
      }

      if (noteHTML) {
        const noteTitle = document.createElement("h4");
        noteTitle.className = "sub-heading";
        noteTitle.innerText = "Error Notes";

        noteGrid.innerHTML = noteHTML;

        s.appendChild(noteTitle);
        s.appendChild(noteGrid);
      }

    } else {
      // ✅ Normal categories (no change)
      if (coinHTML) {
        coinGrid.innerHTML = coinHTML;
        s.appendChild(coinGrid);
      }

      if (noteHTML) {
        noteGrid.innerHTML = noteHTML;
        s.appendChild(noteGrid);
      }
    }

    cards.appendChild(s);
  });
  updateCategoryTabsActiveState();
}

/* CATEGORY TABS NAVIGATION LOGIC */
function selectCategoryTab(categoryName) {
  if (categoryName === "All") {
    // Uncheck all category checkboxes
    document.querySelectorAll(".cat").forEach((c) => (c.checked = false));
  } else {
    const cb = Array.from(document.querySelectorAll(".cat")).find((c) => c.value === categoryName);
    if (!cb) return;

    const wasChecked = cb.checked;

    // Uncheck all category checkboxes first
    document.querySelectorAll(".cat").forEach((c) => (c.checked = false));

    // Toggle clicked one: if it wasn't checked, check it. If it was checked, keep it unchecked (displays all items).
    cb.checked = !wasChecked;
  }

  // Run all dependency availability checks
  if (typeof updateCoinTypeAvailability === "function") updateCoinTypeAvailability();
  if (typeof updateSeriesAvailability === "function") updateSeriesAvailability();
  if (typeof updateCountryAvailability === "function") updateCountryAvailability();
  if (typeof updateDenominationAvailability === "function") updateDenominationAvailability();

  // Apply the filter
  apply();
}

function updateCategoryTabsActiveState() {
  const activeCats = FILTER.cat || [];
  const tabs = document.querySelectorAll(".category-tab");
  tabs.forEach((tab) => {
    const catVal = tab.getAttribute("data-category");
    if (catVal === "All") {
      if (activeCats.length === 0) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    } else {
      if (activeCats.includes(catVal)) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    }
  });
}
// card.addEventListener("click",()=>openItemModal(item));
/* MOBILE SEARCH TOGGLE (Removed as search is now on-page) */

const modal = document.getElementById("itemModal");
const modalContent = modal.querySelector(".modal-content");

function openItemModal(item) {
  document.body.classList.add("modal-open");
  modal.classList.add("active");

  // Decide template type
  if (item.category.includes("Coin")) {
    buildCoinModal(item);
  } else {
    buildNoteModal(item);
  }
}

function closeModal() {
  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
  modalContent.innerHTML = "";
}

modal.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-backdrop")) closeModal();
});

function buildCoinModal(item) {
  modalContent.innerHTML = `
<div class="coin-card">

  <div class="card-header">
    <button class="close-btn"></button>
    <h1 class="coin-title">${item.title}</h1>
    <div class="title-underline"></div>
  </div>

  <div class="card-body">

    <div class="main-content">

      <div class="coin-images">
        <div class="coin-image-container">
          <div class="image-label">Obverse</div>
       <img class="coin-image" src="${item.design?.obverse?.image || FALLBACK_OBV}" onerror="this.src='${FALLBACK_OBV}'">
        </div>

        <div class="coin-image-container">
          <div class="image-label">Reverse</div>
        <img class="coin-image" src="${item.design?.reverse?.image || FALLBACK_REV}" onerror="this.src='${FALLBACK_REV}'">
        </div>
      </div>

      <div class="specifications">
        <h2 class="spec-title">Specifications</h2>
        <div class="spec-grid">

          <div><div class="spec-label">Country</div><div class="spec-value">${item.country || "-"}</div></div>
          <div><div class="spec-label">Denomination</div><div class="spec-value">${item.denomination || "-"}</div></div>
          <div><div class="spec-label">Year</div><div class="spec-value">${item.year || "-"}</div></div>
          <div><div class="spec-label">Metal</div><div class="spec-value">${item.metal || "-"}</div></div>

        </div>
      </div>

    </div>

    <div class="divider"></div>

    <div class="descriptions">
      <div class="description-section">
        <h3 class="description-title">Obverse</h3>
        <p>${item.design.obverse.description || "-"}</p>
      </div>

      <div class="description-section">
        <h3 class="description-title">Reverse</h3>
        <p>${item.design.reverse.description || "-"}</p>
      </div>
    </div>

  </div>
</div>
`;

  modalContent.querySelector(".close-btn").onclick = closeModal;
}

function buildNoteModal(item) {
  modalContent.innerHTML = `
<div class="note-card">

  <div class="card-header">
    <button class="close-btn"></button>
    <h1 class="note-title">${item.title}</h1>
    <div class="title-underline"></div>
  </div>

  <div class="card-body">

    <div class="main-content">

      <div class="note-images">
        <div class="note-image-container">
          <div class="image-label">Front</div>
    <img class="note-image" src="${item.design?.obverse?.image || FALLBACK_OBV}" onerror="this.src='${FALLBACK_OBV}'">
        </div>

        <div class="note-image-container">
          <div class="image-label">Back</div>
         <img class="note-image" src="${item.design?.reverse?.image || FALLBACK_REV}" onerror="this.src='${FALLBACK_REV}'">
        </div>
      </div>

      <div class="specifications">
        <h2 class="spec-title">Specifications</h2>
        <div class="spec-grid">

          <div><div class="spec-label">Country</div><div class="spec-value">${item.country || "-"}</div></div>
          <div><div class="spec-label">Denomination</div><div class="spec-value">${item.denomination || "-"}</div></div>
          <div><div class="spec-label">Year</div><div class="spec-value">${item.year || "-"}</div></div>

        </div>
      </div>

    </div>

  </div>
</div>
`;

  modalContent.querySelector(".close-btn").onclick = closeModal;
}
