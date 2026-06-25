const retailInput = document.getElementById("retailPrice");
const clearBtn = document.getElementById("clearBtn");

const livePriceEl = document.getElementById("livePrice");
const secondPriceEl = document.getElementById("secondPrice");
const eastPriceEl = document.getElementById("eastPrice");
const eastSecondPriceEl = document.getElementById("eastSecondPrice");
const sgPriceEl = document.getElementById("sgPrice");
const pickupPriceEl = document.getElementById("pickupPrice");
const minimumPriceEl = document.getElementById("minimumPrice");

function cleanNumber(value) {
  return Number(String(value).replace(/[^0-9.]/g, "")) || 0;
}

function roundToNearest100(value) {
  return Math.round(value / 100) * 100;
}

function formatRM(value) {
  return "RM" + Math.round(value).toLocaleString("en-MY");
}

function calculate() {
  const retail = cleanNumber(retailInput.value);

  const livePrice = roundToNearest100(retail * 0.9);
  const secondPrice = Math.round(livePrice * 0.95);
  const eastPrice = livePrice + 300;
  const eastSecondPrice = livePrice + 200;
  const sgPrice = livePrice;
  const pickupPrice = livePrice > 500 ? livePrice - 50 : livePrice - 20;
  const minimumPrice = roundToNearest100(retail * 0.8);

  livePriceEl.textContent = formatRM(livePrice);
  secondPriceEl.textContent = formatRM(secondPrice);
  eastPriceEl.textContent = formatRM(eastPrice);
  eastSecondPriceEl.textContent = formatRM(eastSecondPrice);
  sgPriceEl.textContent = formatRM(sgPrice);
  pickupPriceEl.textContent = formatRM(pickupPrice);
  minimumPriceEl.textContent = formatRM(minimumPrice);
}

retailInput.addEventListener("input", calculate);

clearBtn.addEventListener("click", function () {
  retailInput.value = "";
  retailInput.focus();
  calculate();
});

calculate();
