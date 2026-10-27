const API = "https://open.er-api.com/v6/latest/USD";

let rates = {}, currencies = [], current = "from";
let from = "USD", to = "INR";

const currencyNames = new Intl.DisplayNames(['en'], { type: 'currency' });


const specialFlags = {
    EUR: "eu",
    USD: "us",
    GBP: "gb",
    JPY: "jp",
    INR: "in"
};

function getCountryCode(code) {
    return specialFlags[code] || code.slice(0, 2).toLowerCase();
}

function flag(code) {
    return `https://flagcdn.com/w40/${code}.png`;
}

function getName(code) {
    return currencyNames.of(code) || code;
}

// 🔥 FETCH
async function load() {
    const res = await fetch(API);
    const data = await res.json();

    rates = data.rates;
    currencies = Object.keys(rates).sort();

    renderList();
    updateUI();
    if (typeof window.initCalculator === "function") {
        window.initCalculator();
    }
}

// 🔍 DEBOUNCE
function debounce(fn, delay = 300) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

// 🔍 RENDER LIST (FINTECH STYLE)
function renderList(filter = "") {
    const list = document.getElementById("list");
    list.innerHTML = "";

    currencies
        .filter(c => {
            const name = getName(c).toLowerCase();
            return (
                c.toLowerCase().includes(filter.toLowerCase()) ||
                name.includes(filter.toLowerCase())
            );
        })
        .forEach(c => {
            const isSelected = (current === "from" ? from : to) === c;

            const item = document.createElement("div");
            item.className = "currency-item";
            if (isSelected) item.style.background = "#dff7ea";

            item.innerHTML = `
        <img src="${flag(getCountryCode(c))}">
        <div>
          <b>${c}</b><br>
          <small>${getName(c)}</small>
        </div>
     `;

            item.onclick = () => {
                if (current === "from") {
                    from = c;
                    updateUI();
                } else if (current === "to") {
                    to = c;
                    updateUI();
                } else if (current === "multi-target") {
                    if (typeof setMultiTarget === 'function') setMultiTarget(c);
                } else if (current.startsWith("mrow-")) {
                    if (typeof setMrowCurrency === 'function') setMrowCurrency(current, c);
                }

                closeModal();
            };

            list.appendChild(item);
        });
}

// 📦 MODAL ANIMATION
function openModal(type) {
    current = type;
    const modal = document.getElementById("modal");
    modal.classList.add("active");
}

function closeModal() {
    document.getElementById("modal").classList.remove("active");
}

// 🔁 UPDATE UI
function updateUI() {
    document.getElementById("fromCode").innerText = from;
    document.getElementById("toCode").innerText = to;

    document.getElementById("fromName").innerText = getName(from);
    document.getElementById("toName").innerText = getName(to);

    document.getElementById("fromFlag").src = flag(getCountryCode(from));
    document.getElementById("toFlag").src = flag(getCountryCode(to));

    convert();
}

// 💱 CONVERT
function convert() {
    const amt = parseFloat(document.getElementById("amount").value);
    const errorBox = document.getElementById("amountError");

    if (!amt || isNaN(amt)) {
        errorBox.innerText = "Enter amount";
        document.getElementById("result").innerText = "0";
        document.getElementById("rate").innerText = "";
        return;
    } else {
        errorBox.innerText = "";
    }

    const val = (amt / rates[from]) * rates[to];

    document.getElementById("result").innerText = val.toFixed(2);
    document.getElementById("rate").innerText =
        `1 ${from} = ${(rates[to] / rates[from]).toFixed(4)} ${to}`;
}

// EVENTS
document.getElementById("fromBox").onclick = () => openModal("from");
document.getElementById("toBox").onclick = () => openModal("to");

document.getElementById("swapBtn").onclick = () => {
    [from, to] = [to, from];
    updateUI();
};

document.getElementById("amount").addEventListener("input", function (e) {
    let value = e.target.value;

    // Allow only numbers + decimal
    value = value.replace(/[^0-9.]/g, "");

    // Prevent multiple dots
    const parts = value.split(".");
    if (parts.length > 2) {
        value = parts[0] + "." + parts[1];
    }

    e.target.value = value;

    convert(); // trigger conversion
});

// 🔍 SMART SEARCH
document.getElementById("search").addEventListener(
    "input",
    debounce(e => renderList(e.target.value), 200)
);

// CLOSE ON OUTSIDE
document.getElementById("modal").onclick = e => {
    if (e.target.id === "modal") closeModal();
};
document.getElementById("closeModalBtn").onclick = closeModal;
function updateDateTime() {
    const now = new Date();

    const time = now.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });

    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();

    document.getElementById("datetime").innerText =
        `${time} - ${day} ${month} ${year}`;
}

// Run immediately + every second
updateDateTime();
setInterval(updateDateTime, 1000);
load();