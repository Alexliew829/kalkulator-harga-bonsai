// Lover Legend Bonsai Price Calculator V3.7
const retailInput = document.getElementById("retailPrice");
const clearBtn = document.getElementById("clearBtn");

const livePriceEl = document.getElementById("livePrice");
const sameRackPriceEl = document.getElementById("sameRackPrice");
const pickupPriceEl = document.getElementById("pickupPrice");
const minimumPriceEl = document.getElementById("minimumPrice");
const tiktokPriceEl = document.getElementById("tiktokPrice");
const currencySelect = document.getElementById("currencySelect");
const foreignPriceEl = document.getElementById("foreignPrice");
const rateLineEl = document.getElementById("rateLine");
const pullRefreshEl = document.getElementById("pullRefresh");
const indonesiaShippingEl = document.getElementById("indonesiaShipping");
const sgSectionEl = document.querySelector(".sg-section");
const domesticOnlyEls = document.querySelectorAll(".domestic-only");

const EXPORT_CERT_RM = 200;
const PAYMENT_BUFFER = 0.03;

// Fallback only. The page will replace these with the latest online rates when available.
let exchangeRates = {
  IDR: 4389.41,
  TWD: 7.85,
  USD: 0.237
};
let rateLoadedFromWeb = false;

function resetCurrencyToDefault() {
  currencySelect.value = "MYR";
}

function cleanNumber(value) {
  return Number(String(value).replace(/[^0-9.]/g, "")) || 0;
}

function roundToNearest50(value) {
  return Math.round(value / 50) * 50;
}

function roundToNearest10(value) {
  return Math.round(value / 10) * 10;
}

function roundDown100(value) {
  return Math.floor(value / 100) * 100;
}

function roundUp(value, step) {
  return Math.ceil(value / step) * step;
}

function formatRM(value) {
  return "RM" + Number(value).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatIDR(value) {
  return "Rp" + Math.round(value).toLocaleString("id-ID");
}

function getLivePrice(retail) {
  if (retail <= 500) return retail;
  return roundDown100(retail * 0.92);
}

function formatRate(currency, rate) {
  if (currency === "IDR") {
    return "Rate: 1 MYR = Rp" + Number(rate).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  if (currency === "TWD") {
    return "Rate: 1 MYR = NT$" + Number(rate).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  return "Rate: 1 MYR = US$" + Number(rate).toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4
  });
}

function formatIDRCompact(value) {
  if (value <= 0) return "0 jt";
  const rounded = roundUp(value, 100000);
  const juta = rounded / 1000000;
  const decimals = Number.isInteger(juta) ? 0 : 1;
  return juta.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: 1
  }) + " jt";
}

function formatForeignPrice(currency, value) {
  if (currency === "MYR") return formatRM(value);
  if (value <= 0) {
    if (currency === "IDR") return "0 jt";
    if (currency === "TWD") return "NT$0";
    return "US$0";
  }
  if (currency === "IDR") return formatIDRCompact(value);
  if (currency === "TWD") return "NT$" + roundUp(value, 100).toLocaleString("en-US", { maximumFractionDigits: 0 });
  return "US$" + roundUp(value, 1).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function updateForeignPrice(livePrice) {
  const currency = currencySelect.value;

  if (currency === "MYR") {
    foreignPriceEl.textContent = formatRM(livePrice);
    rateLineEl.textContent = "马币 / Ringgit Malaysia";
    return;
  }

  const rate = exchangeRates[currency];
  const protectedMYR = livePrice > 0 ? (livePrice + EXPORT_CERT_RM) / (1 - PAYMENT_BUFFER) : 0;
  const converted = protectedMYR * rate;
  foreignPriceEl.textContent = formatForeignPrice(currency, converted);
  rateLineEl.textContent = formatRate(currency, rate);
}

function updateModeVisibility() {
  const indonesiaMode = currencySelect.value === "IDR";
  domesticOnlyEls.forEach(function (el) { el.hidden = indonesiaMode; });
  if (sgSectionEl) sgSectionEl.hidden = indonesiaMode;
  if (indonesiaShippingEl) indonesiaShippingEl.hidden = !indonesiaMode;
}

function hasRetailPrice() {
  return retailInput.value.trim() !== "" && cleanNumber(retailInput.value) > 0;
}

function getManualLivePrice() {
  return cleanNumber(livePriceEl.value);
}

function setLiveInputMode(retailMode, livePrice) {
  livePriceEl.readOnly = retailMode;
  livePriceEl.classList.toggle("auto-live", retailMode);
  if (retailMode) {
    livePriceEl.value = Number(livePrice).toLocaleString("en-MY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}

function calculate() {
  const retailMode = hasRetailPrice();
  const retail = retailMode ? cleanNumber(retailInput.value) : 0;
  const tiktokPrice = retail * 0.82;
  const livePrice = retailMode ? getLivePrice(retail) : getManualLivePrice();

  setLiveInputMode(retailMode, livePrice);

  const sameRackDiscount = livePrice >= 500 ? "-RM30.00" : "-";
  let pickupDiscount;
  if (livePrice >= 2000) pickupDiscount = 100;
  else if (livePrice >= 500) pickupDiscount = 50;
  else pickupDiscount = 20;

  const pickupPrice = livePrice > 0 ? Math.max(0, livePrice - pickupDiscount) : 0;
  const minimumPrice = livePrice <= 0
    ? 0
    : (retailMode && retail <= 500)
      ? roundToNearest10(retail * 0.9)
      : (!retailMode && livePrice <= 500)
        ? roundToNearest10(livePrice * 0.9)
        : roundToNearest50(livePrice * 0.85);

  sameRackPriceEl.textContent = sameRackDiscount;
  pickupPriceEl.textContent = formatRM(pickupPrice);
  minimumPriceEl.textContent = formatRM(minimumPrice);
  tiktokPriceEl.textContent = retailMode ? "(" + formatRM(tiktokPrice) + ")" : "";
  updateForeignPrice(livePrice);
  updateModeVisibility();
  calculateIndonesiaShipping();
}

async function loadExchangeRates() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/MYR", { cache: "no-store" });
    if (!response.ok) throw new Error("Rate request failed");
    const data = await response.json();
    if (data && data.rates && Number(data.rates.IDR) > 0 && Number(data.rates.TWD) > 0 && Number(data.rates.USD) > 0) {
      exchangeRates = {
        IDR: Number(data.rates.IDR),
        TWD: Number(data.rates.TWD),
        USD: Number(data.rates.USD)
      };
      rateLoadedFromWeb = true;
    }
  } catch (error) {
    rateLoadedFromWeb = false;
  }
  calculate();
}

// Indonesia inland estimate V3.7.
// Reference model for large-cargo pre-sale quoting. J&T Cargo's official checker uses
// origin, destination, weight and dimensions; this static GitHub Pages app has no live tariff API.
// Cargo volumetric weight uses L*W*H/5000. Rates below are conservative market-reference bands,
// NOT official J&T Cargo tariffs. Final freight must still be confirmed by the logistics company.
const INDO_ZONE = {
  JAKARTA:[3500,50], BANTEN:[4500,50], WEST_JAVA:[5000,50], CENTRAL_JAVA:[6000,50],
  YOGYAKARTA:[6000,50], EAST_JAVA:[6500,50], BALI:[8000,50], ACEH:[10500,100],
  NORTH_SUMATRA:[8500,100], WEST_SUMATRA:[9000,100], RIAU:[9000,100], RIAU_ISLANDS:[11500,100],
  JAMBI:[9000,100], SOUTH_SUMATRA:[8000,100], BANGKA:[10500,100], BENGKULU:[9500,100],
  LAMPUNG:[7000,50], WEST_KALIMANTAN:[12000,100], CENTRAL_KALIMANTAN:[13000,100],
  SOUTH_KALIMANTAN:[12000,100], EAST_KALIMANTAN:[13500,100], NORTH_KALIMANTAN:[16000,100],
  NORTH_SULAWESI:[15500,100], GORONTALO:[16500,100], CENTRAL_SULAWESI:[16000,100],
  WEST_SULAWESI:[16500,100], SOUTH_SULAWESI:[12000,100], SOUTHEAST_SULAWESI:[16500,100],
  WEST_NUSA:[11500,100], EAST_NUSA:[16500,100], MALUKU:[21000,100], NORTH_MALUKU:[22000,100],
  PAPUA:[28000,100], WEST_PAPUA:[26000,100], CENTRAL_PAPUA:[30000,100], REMOTE:[32000,100]
};

const PORT_FACTOR = { JAKARTA:1, SURABAYA:0.98, SEMARANG:0.98, MEDAN:0.98, MAKASSAR:1.00 };

function calculateIndonesiaShipping() {
  const sec = indonesiaShippingEl;
  if (!sec) return;
  const get = function(id){ return document.getElementById(id); };
  const sea = Math.max(0, cleanNumber(get("indoSeaRm").value));
  const l = Math.max(1, cleanNumber(get("indoL").value));
  const w = Math.max(1, cleanNumber(get("indoW").value));
  const h = Math.max(1, cleanNumber(get("indoH").value));
  const kg = Math.max(0.1, cleanNumber(get("indoKg").value));
  const province = get("indoProvince").value;
  const port = get("indoPort").value;
  const postcode = get("indoPostcode").value.replace(/\D/g, "").slice(0,5);
  if (get("indoPostcode").value !== postcode) get("indoPostcode").value = postcode;

  const volKg = (l * w * h) / 5000;
  const chargeKg = Math.max(kg, volKg);
  const z = INDO_ZONE[province] || INDO_ZONE.REMOTE;
  const billKg = Math.max(chargeKg, z[1]);
  const portFactor = PORT_FACTOR[port] || 1;
  let inlandIdr = z[0] * billKg * portFactor;

  // Conservative buffer for pre-sale quotes and unusually bulky/tall cargo.
  inlandIdr *= 1.15;
  const maxSide = Math.max(l,w,h);
  if (maxSide > 120) inlandIdr *= 1.10;
  if (maxSide > 180) inlandIdr *= 1.12;
  if (postcode && province !== "JAKARTA") inlandIdr *= 1.03;
  inlandIdr = roundUp(inlandIdr, 50000);

  const idrRate = exchangeRates.IDR > 0 ? exchangeRates.IDR : 4389.41;
  const inlandRm = roundUp(inlandIdr / idrRate, 10);
  const totalRm = roundUp(sea + inlandRm, 10);
  const totalIdr = roundUp(totalRm * idrRate, 50000);

  get("indoSeaOut").textContent = formatRM(sea);
  get("indoInlandOut").textContent = formatRM(inlandRm);
  get("indoVolOut").textContent = volKg.toLocaleString("en-MY", {minimumFractionDigits:1, maximumFractionDigits:1}) + " kg";
  get("indoChargeOut").textContent = chargeKg.toLocaleString("en-MY", {minimumFractionDigits:1, maximumFractionDigits:1}) + " kg";
  get("indoTotalIdr").textContent = formatIDR(totalIdr);
  get("indoTotalRm").textContent = "约 " + formatRM(totalRm) + " / Anggaran " + formatRM(totalRm);

  const note = get("indoNote");
  const pc = postcode.length === 5 ? " Postcode <strong>" + postcode + "</strong> 已记录。" : "";
  note.innerHTML = "J&T Cargo 市场参考估算，不是 J&T 官方实时报价。" + pc + " 实际收费以物流公司确认为准。<br>Anggaran rujukan pasaran J&T Cargo, bukan kadar rasmi masa nyata. Caj sebenar tertakluk kepada pengesahan syarikat logistik.";
}

retailInput.addEventListener("focus", function () { retailInput.select(); });
retailInput.addEventListener("blur", function () {
  if (retailInput.value.trim() === "" || cleanNumber(retailInput.value) <= 0) retailInput.value = "";
  else retailInput.value = cleanNumber(retailInput.value).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  calculate();
});
retailInput.addEventListener("input", calculate);
retailInput.addEventListener("keydown", function (event) { if (event.key === "Enter") retailInput.blur(); });

livePriceEl.addEventListener("focus", function () { if (!livePriceEl.readOnly) livePriceEl.select(); });
livePriceEl.addEventListener("input", function () { if (!livePriceEl.readOnly) calculate(); });
livePriceEl.addEventListener("blur", function () {
  if (!livePriceEl.readOnly) {
    const value = getManualLivePrice();
    livePriceEl.value = value > 0 ? value.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
    calculate();
  }
});
livePriceEl.addEventListener("keydown", function (event) { if (event.key === "Enter") livePriceEl.blur(); });

currencySelect.addEventListener("change", calculate);

document.querySelectorAll("#indonesiaShipping input, #indonesiaShipping select").forEach(function (el) {
  el.addEventListener("input", calculateIndonesiaShipping);
  el.addEventListener("change", calculateIndonesiaShipping);
});

clearBtn.addEventListener("click", function () {
  retailInput.value = "";
  livePriceEl.readOnly = false;
  livePriceEl.classList.remove("auto-live");
  livePriceEl.value = "";
  retailInput.focus();
  calculate();
});

function resetCalculator() {
  retailInput.value = "";
  livePriceEl.readOnly = false;
  livePriceEl.classList.remove("auto-live");
  livePriceEl.value = "";
  calculate();
}

async function clearLegacyPwaCache() {
  let hadController = false;
  try {
    if ("serviceWorker" in navigator) {
      hadController = Boolean(navigator.serviceWorker.controller);
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(function (registration) { return registration.unregister(); }));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(function (key) { return caches.delete(key); }));
    }
  } catch (error) {}

  if (hadController) {
    try {
      const reloadKey = "loverLegendPwaCleanupV35";
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, "1");
        location.reload();
        return true;
      }
    } catch (error) {}
  }
  return false;
}

function enablePullToRefresh() {
  if (!pullRefreshEl) return;
  let startY = 0;
  let pullDistance = 0;
  let tracking = false;
  const triggerDistance = 75;
  function pageIsAtTop() { return window.scrollY <= 0 && document.documentElement.scrollTop <= 0; }

  document.addEventListener("touchstart", function (event) {
    if (!pageIsAtTop() || event.touches.length !== 1) { tracking = false; return; }
    startY = event.touches[0].clientY;
    pullDistance = 0;
    tracking = true;
    pullRefreshEl.classList.remove("ready");
  }, { passive: true });

  document.addEventListener("touchmove", function (event) {
    if (!tracking || event.touches.length !== 1) return;
    const currentY = event.touches[0].clientY;
    const delta = currentY - startY;
    if (delta <= 0 || !pageIsAtTop()) {
      pullDistance = 0;
      pullRefreshEl.classList.remove("show", "ready");
      return;
    }
    pullDistance = Math.min(delta * 0.55, 95);
    pullRefreshEl.style.transform = "translate(-50%, " + Math.max(0, pullDistance - 42) + "px)";
    pullRefreshEl.classList.add("show");
    if (pullDistance >= triggerDistance) {
      pullRefreshEl.textContent = "↑ 放开刷新 / Lepas untuk Refresh";
      pullRefreshEl.classList.add("ready");
    } else {
      pullRefreshEl.textContent = "↓ 下拉刷新 / Tarik untuk Refresh";
      pullRefreshEl.classList.remove("ready");
    }
    if (event.cancelable) event.preventDefault();
  }, { passive: false });

  document.addEventListener("touchend", function () {
    if (!tracking) return;
    tracking = false;
    if (pullDistance >= triggerDistance) {
      pullRefreshEl.textContent = "刷新中... / Refreshing...";
      pullRefreshEl.classList.add("show", "refreshing");
      setTimeout(function () { location.reload(); }, 120);
      return;
    }
    pullDistance = 0;
    pullRefreshEl.classList.remove("show", "ready");
    pullRefreshEl.style.transform = "translate(-50%, -48px)";
  }, { passive: true });

  document.addEventListener("touchcancel", function () {
    tracking = false;
    pullDistance = 0;
    pullRefreshEl.classList.remove("show", "ready");
    pullRefreshEl.style.transform = "translate(-50%, -48px)";
  }, { passive: true });
}

async function startCalculator() {
  const reloading = await clearLegacyPwaCache();
  if (reloading) return;
  resetCurrencyToDefault();
  resetCalculator();
  loadExchangeRates();
}

enablePullToRefresh();
startCalculator();

// Browser back/forward keeps the current currency and Indonesia inputs.
// A real refresh reloads the page and returns the default currency to MYR.
window.addEventListener("pageshow", function () {
  calculate();
});
