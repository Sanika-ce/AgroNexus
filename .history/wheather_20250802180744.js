// weather.js

const API_ID = "1bc2c747c9b88ec10a9c4c4db4c29b3a";
// Replace with your actual backend base URL
const BASE_URL = "https://your-api.example.com";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    // Use whichever header your backend expects:
    Authorization: `Bearer ${API_ID}`,
    // or: "x-api-key": API_ID
  };
}

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      ...authHeaders(),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Fetch failed ${res.status}: ${body}`);
  }
  return res.json();
}

document.addEventListener("DOMContentLoaded", function () {
  const stateSelect = document.getElementById("state");
  const districtSelect = document.getElementById("district");
  const villageSelect = document.getElementById("village");
  const getWeatherBtn = document.getElementById("getWeatherBtn");
  const forecastSection = document.getElementById("forecastSection");
  const selectedLocationP = document.getElementById("selectedLocation");
  const forecastCards = document.getElementById("forecastCards");
  const advisoryGrid = document.getElementById("advisoryGrid");
  const locationError = document.getElementById("locationError");

  function normalize(str) {
    return String(str || "").trim();
  }

  async function loadStates() {
    try {
      const data = await fetchJson(`${BASE_URL}/api/states`);
      stateSelect.innerHTML = '<option value="">-- Choose your state --</option>';
      data.forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.value ?? s.name;
        opt.textContent = s.name;
        stateSelect.appendChild(opt);
      });
    } catch (err) {
      console.error(err);
      if (locationError) {
        locationError.textContent = "Failed to load states.";
        locationError.style.display = "block";
      }
    }
  }

  async function loadDistricts(state) {
    districtSelect.innerHTML = "<option value=''>-- Select district --</option>";
    districtSelect.disabled = true;
    villageSelect.innerHTML = "<option value=''>-- Select village --</option>";
    villageSelect.disabled = true;
    getWeatherBtn.disabled = true;

    if (!state) return;

    try {
      const data = await fetchJson(
        `${BASE_URL}/api/districts?state=${encodeURIComponent(state)}`
      );
      data.forEach((d) => {
        const opt = document.createElement("option");
        opt.value = d.value ?? d.name;
        opt.textContent = d.name;
        districtSelect.appendChild(opt);
      });
      districtSelect.disabled = false;
    } catch (err) {
      console.error(err);
      if (locationError) {
        locationError.textContent = "Failed to load districts.";
        locationError.style.display = "block";
      }
    }
  }

  async function loadVillages(state, district) {
    villageSelect.innerHTML = "<option value=''>-- Select village --</option>";
    villageSelect.disabled = true;
    getWeatherBtn.disabled = true;

    if (!state || !district) return;

    try {
      const data = await fetchJson(
        `${BASE_URL}/api/villages?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`
      );
      data.forEach((v) => {
        const opt = document.createElement("option");
        opt.value = v.value ?? v.name;
        opt.textContent = v.name;
        villageSelect.appendChild(opt);
      });
      villageSelect.disabled = false;
    } catch (err) {
      console.error(err);
      if (locationError) {
        locationError.textContent = "Failed to load villages.";
        locationError.style.display = "block";
      }
    }
  }

  async function fetchWeather(state, district, village) {
    try {
      const payload = await fetchJson(
        `${BASE_URL}/api/weather?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&village=${encodeURIComponent(village)}`
      );
      renderForecast(payload);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch weather forecast.");
    }
  }

  function iconForCondition(cond) {
    if (!cond) return '<i class="fas fa-cloud"></i>';
    const lc = cond.toLowerCase();
    if (lc.includes("rain")) return '<i class="fas fa-cloud-showers-heavy"></i>';
    if (lc.includes("sun") || lc.includes("clear")) return '<i class="fas fa-sun"></i>';
    if (lc.includes("cloud")) return '<i class="fas fa-cloud"></i>';
    if (lc.includes("storm")) return '<i class="fas fa-bolt"></i>';
    if (lc.includes("snow")) return '<i class="fas fa-snowflake"></i>';
    return '<i class="fas fa-cloud"></i>';
  }

  function renderForecast(payload) {
    if (forecastSection) forecastSection.style.display = "block";
    if (selectedLocationP) selectedLocationP.textContent = payload.location || "--";

    if (forecastCards) {
      forecastCards.innerHTML = "";
      if (Array.isArray(payload.daily)) {
        payload.daily.forEach((d) => {
          const card = document.createElement("div");
          card.className = "forecast-card";
          card.innerHTML = `
            <div class="card-header">
              <div class="date">${d.date || ""}</div>
              <div class="day">${d.day || ""}</div>
            </div>
            <div class="card-body">
              <div class="weather-icon">${iconForCondition(d.condition)}</div>
              <div class="temperature">${d.temp?.max ?? "-"}° / ${d.temp?.min ?? "-"}°</div>
              <div class="weather-condition">${d.condition || ""}</div>
              <div class="weather-details">
                <div class="detail">
                  <i class="fas fa-tint"></i>
                  <div class="label">Precip</div>
                  <div class="value">${d.precipitation ?? "-"}%</div>
                </div>
                <div class="detail">
                  <i class="fas fa-water"></i>
                  <div class="label">Humidity</div>
                  <div class="value">${d.humidity ?? "-"}%</div>
                </div>
                <div class="detail">
                  <i class="fas fa-wind"></i>
                  <div class="label">Wind</div>
                  <div class="value">${d.wind ?? "-"} km/h</div>
                </div>
              </div>
            </div>
          `;
          forecastCards.appendChild(card);
        });
      }
    }

    if (advisoryGrid) {
      advisoryGrid.innerHTML = "";
      if (Array.isArray(payload.advisory)) {
        payload.advisory.forEach((a) => {
          const card = document.createElement("div");
          card.className = "advisory-card";
          card.innerHTML = `
            <h4><i class="fas fa-info-circle"></i> ${a.title}</h4>
            <p>${a.text}</p>
          `;
          advisoryGrid.appendChild(card);
        });
      }
    }
  }

  // Event wiring
  stateSelect.addEventListener("change", async () => {
    if (locationError) locationError.style.display = "none";
    const state = normalize(stateSelect.value);
    await loadDistricts(state);
  });

  districtSelect.addEventListener("change", async () => {
    if (locationError) locationError.style.display = "none";
    const state = normalize(stateSelect.value);
    const district = normalize(districtSelect.value);
    await loadVillages(state, district);
  });

  villageSelect.addEventListener("change", () => {
    getWeatherBtn.disabled = !villageSelect.value;
  });

  getWeatherBtn.addEventListener("click", () => {
    const state = normalize(stateSelect.value);
    const district = normalize(districtSelect.value);
    const village = normalize(villageSelect.value);
    if (!state || !district || !village) {
      alert("Please select state, district, and village.");
      return;
    }
    fetchWeather(state, district, village);
  });

  // init
  loadStates();
});
