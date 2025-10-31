// weather.js (API-only version)

const API_ID = "1bc2c747c9b88ec10a9c4c4db4c29b3a";

// Replace these with your real endpoint URLs (can be full or relative)
const ENDPOINTS = {
  states: "/api/states",
  districts: "/api/districts", // expects ?state=...
  villages: "/api/villages",   // expects ?state=&district=
  weather: "/api/weather",     // expects ?state=&district=&village=
};

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_ID}`, // or "x-api-key": API_ID if that's what your backend expects
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
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return res.json();
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

document.addEventListener("DOMContentLoaded", () => {
  const stateSelect = document.getElementById("state");
  const districtSelect = document.getElementById("district");
  const villageSelect = document.getElementById("village");
  const getWeatherBtn = document.getElementById("getWeatherBtn");
  const forecastSection = document.getElementById("forecastSection");
  const selectedLocationP = document.getElementById("selectedLocation");
  const forecastCards = document.getElementById("forecastCards");
  const advisoryGrid = document.getElementById("advisoryGrid");
  const locationError = document.getElementById("locationError");

  if (!stateSelect || !districtSelect || !villageSelect || !getWeatherBtn) {
    console.error("Required DOM elements missing. Check that IDs match.");
    return;
  }

  // initial disabled state
  districtSelect.disabled = true;
  villageSelect.disabled = true;
  getWeatherBtn.disabled = true;

  function clear(selectEl, placeholder) {
    selectEl.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = placeholder;
    selectEl.appendChild(opt);
  }

  function showError(msg) {
    if (locationError) {
      locationError.textContent = msg;
      locationError.style.display = "block";
    } else {
      console.warn(msg);
    }
  }

  function hideError() {
    if (locationError) locationError.style.display = "none";
  }

  // Load states
  async function loadStates() {
    try {
      const data = await fetchJson(ENDPOINTS.states);
      clear(stateSelect, "-- Choose your state --");
      data.forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.value ?? s.name;
        opt.textContent = s.name;
        stateSelect.appendChild(opt);
      });
    } catch (err) {
      showError("Failed to load states: " + err.message);
    }
  }

  // Load districts for selected state
  async function loadDistricts(state) {
    clear(districtSelect, "-- Select district --");
    clear(villageSelect, "-- Select village --");
    districtSelect.disabled = true;
    villageSelect.disabled = true;
    getWeatherBtn.disabled = true;

    if (!state) return;

    try {
      const data = await fetchJson(`${ENDPOINTS.districts}?state=${encodeURIComponent(state)}`);
      data.forEach((d) => {
        const opt = document.createElement("option");
        opt.value = d.value ?? d.name;
        opt.textContent = d.name;
        districtSelect.appendChild(opt);
      });
      districtSelect.disabled = false;
    } catch (err) {
      showError("Failed to load districts: " + err.message);
    }
  }

  // Load villages for state+district
  async function loadVillages(state, district) {
    clear(villageSelect, "-- Select village --");
    villageSelect.disabled = true;
    getWeatherBtn.disabled = true;

    if (!state || !district) return;

    try {
      const data = await fetchJson(
        `${ENDPOINTS.villages}?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`
      );
      data.forEach((v) => {
        const opt = document.createElement("option");
        opt.value = v.value ?? v.name;
        opt.textContent = v.name;
        villageSelect.appendChild(opt);
      });
      villageSelect.disabled = false;
    } catch (err) {
      showError("Failed to load villages: " + err.message);
    }
  }

  // Fetch and render weather
  async function getWeather(state, district, village) {
    try {
      const payload = await fetchJson(
        `${ENDPOINTS.weather}?state=${encodeURIComponent(state)}&district=${encodeURIComponent(
          district
        )}&village=${encodeURIComponent(village)}`
      );
      renderForecast(payload);
    } catch (err) {
      showError("Failed to fetch weather: " + err.message);
    }
  }

  function renderForecast(payload) {
    hideError();
    if (forecastSection) forecastSection.style.display = "block";
    if (selectedLocationP) selectedLocationP.textContent = payload.location || "--";

    // daily cards
    if (forecastCards) {
      forecastCards.innerHTML = "";
      if (Array.isArray(payload.daily)) {
        payload.daily.forEach((d) => {
          const card = document.createElement("div");
          card.className = "forecast-card";
          card.innerHTML = `
            <div style="margin-bottom:6px;"><strong>${d.day || ""}</strong> &middot; ${d.date || ""}</div>
            <div style="display:flex; gap:10px; align-items:center;">
              <div style="font-size:26px;">${iconForCondition(d.condition)}</div>
              <div>
                <div style="font-weight:600;">${d.condition}</div>
                <div>${d.temp?.max ?? "-"}° / ${d.temp?.min ?? "-"}°</div>
                <div style="font-size:12px; margin-top:4px;">
                  Precip: ${d.precipitation ?? "-"}% | Humidity: ${d.humidity ?? "-"}% | Wind: ${d.wind ?? "-"} km/h
                </div>
              </div>
            </div>
          `;
          forecastCards.appendChild(card);
        });
      }
    }

    // advisory
    if (advisoryGrid) {
      advisoryGrid.innerHTML = "";
      if (Array.isArray(payload.advisory)) {
        payload.advisory.forEach((a) => {
          const ad = document.createElement("div");
          ad.className = "advisory-card";
          ad.innerHTML = `
            <h4 style="margin-bottom:6px;">${a.title}</h4>
            <p style="margin:0;">${a.text}</p>
          `;
          advisoryGrid.appendChild(ad);
        });
      }
    }
  }

  // Event listeners
  stateSelect.addEventListener("change", async () => {
    hideError();
    const state = stateSelect.value;
    await loadDistricts(state);
  });

  districtSelect.addEventListener("change", async () => {
    hideError();
    const state = stateSelect.value;
    const district = districtSelect.value;
    await loadVillages(state, district);
  });

  villageSelect.addEventListener("change", () => {
    getWeatherBtn.disabled = !villageSelect.value;
  });

  getWeatherBtn.addEventListener("click", () => {
    const state = stateSelect.value;
    const district = districtSelect.value;
    const village = villageSelect.value;
    if (!state || !district || !village) {
      alert("Please select state, district, and village.");
      return;
    }
    getWeather(state, district, village);
  });

  // bootstrap
  loadStates();
});
