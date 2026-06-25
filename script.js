const retailInput = document.getElementById("retailPrice");
const clearBtn = document.getElementById("clearBtn");

const livePriceEl = document.getElementById("livePrice");
const pickupPriceEl = document.getElementById("pickupPrice");
const minimumPriceEl = document.getElementById("minimumPrice");

function cleanNumber(value) {
  return Number(String(value).replace(/[^0-9.]/g, "")) || 0;
}

function roundToNearest50(value) {
  return Math.round(value / 50) * 50;
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

function calculate() {
  const retail = cleanNumber(retailInput.value);

 let livePrice;

if (retail < 550) {
    livePrice = roundToNearest50(retail * 0.95);
} else {
    livePrice = roundToNearest50(retail * 0.90);
}
  const pickupPrice = livePrice > 500 ? livePrice - 50 : livePrice - 20;
  const minimumPrice = roundToNearest50(retail * 0.8);

  livePriceEl.textContent = formatRM(livePrice);
  pickupPriceEl.textContent = formatRM(pickupPrice);
  minimumPriceEl.textContent = formatRM(minimumPrice);
}

retailInput.addEventListener("focus", function () {
  if (cleanNumber(retailInput.value) === 0) {
    retailInput.value = "";
  }
});

retailInput.addEventListener("blur", function () {
  const value = cleanNumber(retailInput.value);
  retailInput.value = value.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
});

retailInput.addEventListener("input", calculate);

clearBtn.addEventListener("click", function () {
  retailInput.value = "0.00";
  retailInput.focus();
  calculate();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js").catch(function () {});
  });
}

calculate();
