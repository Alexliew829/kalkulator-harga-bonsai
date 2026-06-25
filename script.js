const retailInput = document.getElementById("retailPrice");

const livePriceEl = document.getElementById("livePrice");
const secondPriceEl = document.getElementById("secondPrice");
const eastPriceEl = document.getElementById("eastPrice");
const eastSecondPriceEl = document.getElementById("eastSecondPrice");
const sgPriceEl = document.getElementById("sgPrice");
const selfPickupPriceEl = document.getElementById("selfPickupPrice");
const minimumPriceEl = document.getElementById("minimumPrice");
const copyBtn = document.getElementById("copyBtn");

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

  const selfPickupPrice = livePrice > 500 ? livePrice - 50 : livePrice - 20;

  const minimumPrice = roundToNearest100(retail * 0.8);

  livePriceEl.textContent = formatRM(livePrice);
  secondPriceEl.textContent = formatRM(secondPrice);
  eastPriceEl.textContent = formatRM(eastPrice);
  eastSecondPriceEl.textContent = formatRM(eastSecondPrice);
  sgPriceEl.textContent = formatRM(sgPrice);
  selfPickupPriceEl.textContent = formatRM(selfPickupPrice);
  minimumPriceEl.textContent = formatRM(minimumPrice);
}

function copyPrice() {
  const text = `
Lover Legend Gardening

Kalkulator Harga Bonsai / 盆景价格计算器

直播售价 Harga Live: ${livePriceEl.textContent}
第二棵同木架: ${secondPriceEl.textContent}
东马木架+运费: ${eastPriceEl.textContent}
东马第二棵: ${eastSecondPriceEl.textContent}
新加坡: ${sgPriceEl.textContent}
花圃自取: ${selfPickupPriceEl.textContent}
最低售价: ${minimumPriceEl.textContent}

SG 运费自付：司机送上门时直接付款给司机。1掌约 SGD15，2掌约 SGD30，太高/太重另加。

仅供查看价格，付款必须交给管理方处理。
`.trim();

  navigator.clipboard.writeText(text);
  alert("报价已复制 / Harga sudah disalin");
}

retailInput.addEventListener("input", calculate);
copyBtn.addEventListener("click", copyPrice);

calculate();console.log("Lover Legend Gardening");
