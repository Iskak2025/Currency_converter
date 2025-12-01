const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const amount = document.getElementById("amount");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");

const searchFrom = document.getElementById("searchFrom");
const searchTo = document.getElementById("searchTo");
const swapBtn = document.getElementById("swapBtn");

const API_KEY = "e2e82d1ca96a9469d6f75143";
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

let allCurrencies = [];

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    allCurrencies = Object.keys(data.conversion_rates);

    
    searchFrom.value = localStorage.getItem("searchFrom") || "";
    searchTo.value = localStorage.getItem("searchTo") || "";

    renderCurrencyOptions(allCurrencies);

    
    fromCurrency.value = localStorage.getItem("fromCurrency") || "USD";
    toCurrency.value = localStorage.getItem("toCurrency") || "EUR";
    amount.value = localStorage.getItem("amount") || 1;
    result.innerHTML = localStorage.getItem("result") || "";
  })
  .catch(() => {
    result.textContent = "Ошибка при загрузке списка валют 😔";
  });

// Функция для рендеринга валют с учётом поиска
function renderCurrencyOptions(currencies) {
  const currentFrom = fromCurrency.value;
  const currentTo = toCurrency.value;

  const filteredFrom = currencies.filter(c => c.includes(searchFrom.value.toUpperCase()));
  const filteredTo = currencies.filter(c => c.includes(searchTo.value.toUpperCase()));

  fromCurrency.innerHTML = "";
  toCurrency.innerHTML = "";

  // Если выбранная валюта не проходит фильтр, добавляем её в начало
  if (!filteredFrom.includes(currentFrom)) filteredFrom.unshift(currentFrom);
  if (!filteredTo.includes(currentTo)) filteredTo.unshift(currentTo);

  filteredFrom.forEach(cur => {
    fromCurrency.innerHTML += `<option value="${cur}">${cur}</option>`;
  });

  filteredTo.forEach(cur => {
    toCurrency.innerHTML += `<option value="${cur}">${cur}</option>`;
  });

  fromCurrency.value = currentFrom;
  toCurrency.value = currentTo;
}

// 🔍 Поиск для FROM
searchFrom.addEventListener("input", () => {
  localStorage.setItem("searchFrom", searchFrom.value);
  renderCurrencyOptions(allCurrencies);
});

// 🔍 Поиск для TO
searchTo.addEventListener("input", () => {
  localStorage.setItem("searchTo", searchTo.value);
  renderCurrencyOptions(allCurrencies);
});

// Конвертация
convertBtn.addEventListener("click", () => {
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amt = parseFloat(amount.value);

  if (isNaN(amt) || amt <= 0) {
    result.textContent = "Введите корректную сумму!";
    return;
  }

  fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${from}/${to}`)
    .then(res => res.json())
    .then(data => {
      if (!data.conversion_rate) throw new Error("Нет курса");

      const rate = data.conversion_rate;
      const converted = (amt * rate).toFixed(2);
      const displayResult = `${amt} ${from} = <b>${converted} ${to}</b>`;
      result.innerHTML = displayResult;

      // Сохраняем всё в localStorage
      localStorage.setItem("fromCurrency", from);
      localStorage.setItem("toCurrency", to);
      localStorage.setItem("amount", amt);
      localStorage.setItem("result", displayResult);
    })
    .catch(() => {
      result.textContent = "Ошибка при получении данных 😔";
    });
});

// Swap валют
swapBtn.addEventListener("click", () => {
  // Меняем местами значения селектов
  const temp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = temp;

  // Сбрасываем поиск, чтобы выбранные валюты точно отобразились
  const oldSearchFrom = searchFrom.value;
  const oldSearchTo = searchTo.value;
  searchFrom.value = "";
  searchTo.value = "";

  renderCurrencyOptions(allCurrencies);

  // Восстанавливаем поиск после обновления
  searchFrom.value = oldSearchFrom;
  searchTo.value = oldSearchTo;

  // Сохраняем новые значения в localStorage
  localStorage.setItem("fromCurrency", fromCurrency.value);
  localStorage.setItem("toCurrency", toCurrency.value);

  // Автоматически конвертируем с новыми значениями
  convertBtn.click();
});
