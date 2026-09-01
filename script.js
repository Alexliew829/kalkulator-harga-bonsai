// Lover Legend Bonsai Price Calculator V2.9
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

const EXPORT_CERT_RM = 200;
const PAYMENT_BUFFER = 0.03;

// Fallback only. The page will replace these with the latest online rates when available.
let exchangeRates = {
  IDR: 4389.41,
  TWD: 7.85,
  USD: 0.237
};
let rateLoadedFromWeb = false;

const CURRENCY_STORAGE_KEY = "loverLegendBonsaiCurrency";

function restoreCurrencySelection() {
  try {
    const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (["IDR", "TWD", "USD"].includes(savedCurrency)) {
      currencySelect.value = savedCurrency;
    }
  } catch (error) {
    // If localStorage is unavailable, keep the default IDR selection.
  }
}

function saveCurrencySelection() {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currencySelect.value);
  } catch (error) {
    // Ignore storage errors; calculator still works normally.
  }
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
  return (
    "RM" +
    Number(value).toLocaleString("en-MY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  );
}

function getLivePrice(retail) {
  if (retail <= 500) {
    return retail;
  }
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
  if (value <= 0) {
    if (currency === "IDR") return "0 jt";
    if (currency === "TWD") return "NT$0";
    return "US$0";
  }

  if (currency === "IDR") {
    return formatIDRCompact(value);
  }

  if (currency === "TWD") {
    const rounded = roundUp(value, 100);
    return "NT$" + rounded.toLocaleString("en-US", {
      maximumFractionDigits: 0
    });
  }

  const rounded = roundUp(value, 1);
  return "US$" + rounded.toLocaleString("en-US", {
    maximumFractionDigits: 0
  });
}

function updateForeignPrice(livePrice) {
  const currency = currencySelect.value;
  const rate = exchangeRates[currency];

  // Export quote rule kept in the calculation only:
  // live price + RM200 certificate, with 3% payment/exchange buffer.
  const protectedMYR = livePrice > 0
    ? (livePrice + EXPORT_CERT_RM) / (1 - PAYMENT_BUFFER)
    : 0;

  const converted = protectedMYR * rate;
  foreignPriceEl.textContent = formatForeignPrice(currency, converted);
  rateLineEl.textContent = formatRate(currency, rate);
}

function calculate() {
  const retail = cleanNumber(retailInput.value);
  const tiktokPrice = retail * 0.82;
  const livePrice = getLivePrice(retail);

  const sameRackDiscount = livePrice >= 500 ? "-RM30.00" : "-";

  let pickupDiscount;

  if (livePrice >= 2000) {
    pickupDiscount = 100;
  } else if (livePrice >= 500) {
    pickupDiscount = 50;
  } else {
    pickupDiscount = 20;
  }

  const pickupPrice = retail === 0 ? 0 : livePrice - pickupDiscount;
  const minimumPrice =
    retail <= 500
      ? roundToNearest10(retail * 0.9)
      : roundToNearest50(livePrice * 0.85);

  livePriceEl.textContent = formatRM(livePrice);
  sameRackPriceEl.textContent = sameRackDiscount;
  pickupPriceEl.textContent = formatRM(pickupPrice);
  minimumPriceEl.textContent = formatRM(minimumPrice);
  tiktokPriceEl.textContent = "(" + formatRM(tiktokPrice) + ")";
  updateForeignPrice(livePrice);
}

async function loadExchangeRates() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/MYR", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Rate request failed");
    }

    const data = await response.json();

    if (
      data &&
      data.rates &&
      Number(data.rates.IDR) > 0 &&
      Number(data.rates.TWD) > 0 &&
      Number(data.rates.USD) > 0
    ) {
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

retailInput.addEventListener("focus", function () {
  retailInput.select();
});

retailInput.addEventListener("blur", function () {
  const value = cleanNumber(retailInput.value);
  retailInput.value = value.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
});

retailInput.addEventListener("input", calculate);

retailInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    retailInput.blur();
  }
});

currencySelect.addEventListener("change", function () {
  saveCurrencySelection();
  calculate();
});

clearBtn.addEventListener("click", function () {
  retailInput.value = "0.00";
  retailInput.focus();
  calculate();
});

function resetCalculator() {
  retailInput.value = "0.00";
  calculate();
}

restoreCurrencySelection();
resetCalculator();
loadExchangeRates();

window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    location.reload();
  } else {
    restoreCurrencySelection();
    resetCalculator();
    loadExchangeRates();
  }
});
