// weather.js

const API_ID = "1bc2c747c9b88ec10a9c4c4db4c29b3a";
// Replace with your real backend base URL
const BASE_URL = "https://your-api.example.com";

/**
 * Static fallback data for cascading selects if API fails.
 */
const staticLocationData = {
  maharashtra: {
    pune: ["Hinjewadi", "Baner", "Hadapsar", "Kothrud", "Shivajinagar"],
    mumbai: ["Andheri", "Bandra", "Dadar", "Colaba", "Kurla"],
    nashik: ["Deolali", "Sinnar", "Trimbak", "Malegaon", "Ghoti"],
    nagpur: ["Hingna", "Katol", "Ramtek", "Umred", "Brahmapuri"],
  },
  punjab: {
    ludhiana: ["Jagraon", "Raikot", "Samrala", "Dhurkot", "Mullanpur"],
    amritsar: ["Ajnala", "Majitha", "Verka", "Raja Sansi", "Gurree Majra"],
    patiala: ["Rajpura", "Samana", "Patran", "Banur", "Bhagta Bhai Ka"],
    bathinda: ["Mansa", "Talwandi Sabo", "Barnala", "Maur", "Khanpur"],
  },
  gujarat: {
    ahmedabad: ["Maninagar", "Navrangpura", "Gota", "Bodakdev", "Shahibaug"],
    surat: ["Adajan", "Udhna", "Varachha", "Piplod", "Katargam"],
    vadodara: ["Akota", "Gotri", "Padra", "Harni", "Vasna"],
    rajkot: ["Jetpur", "Jamnagar", "Morbi", "Gondal", "Saurashtra University Area"],
  },
  tamilnadu: {
    chennai: ["T. Nagar", "Anna Nagar", "Velachery", "Adyar", "Porur"],
    coimbatore: ["R.S. Puram", "Gandhipuram", "Saibaba Colony", "Sivananda Colony", "Singanallur"],
    madurai: ["Thirunagar", "K.K. Nagar", "Simmakkal", "Alagar Kovil", "Vilangudi"],
  },
  karnataka: {
    bengaluru: ["Indiranagar", "Whitefield", "Koramangala", "Yelahanka", "Jayanagar"],
    mysuru: ["VV Mohalla", "JP Nagar", "Nazarbad", "Gokulam", "Kukkarahalli"],
    hubli: ["Vidyanagar", "Navanagar", "Gokul", "Gudigeri", "Kudchi"],
  },
  uttarpradesh: {
    lucknow: ["Gomti Nagar", "Aliganj", "Indira Nagar", "Chowk", "Hazratganj"],
    varanasi: ["Sigra", "Lalpur", "Ganj", "Shivala", "Shivpur"],
    agra: ["Shahganj", "Khandari", "Fatehabad", "Sadar", "Kheria"],
  },
};

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_ID}`, // or use "x-api-key": API_ID if your backend expects that
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

function capitalizeWords(str = "") {
  return str
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

function clearSelect(selectEl, placeholder) {
  selectEl.innerHTML = "";
  const o = document.createElement("option");
  o.value = "";
  o.textContent = placeholder;
  selectEl.appendChild(o);
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

  if (!stateSelect || !districtSelect || !villageSelect || !getWeatherBtn) {
    console.error("Missing required DOM elements; check IDs.");
    return;
  }

  // initialize
  getWeatherBtn.disabled = true;
  districtSelect.disabled = true;
  villageSelect.disabled = true;

  // Load states from API with fallback to static keys
  async function loadStates() {
    try {
      const data = await fetchJson(`${BASE_URL}/api/states`);
      populateStateOptions(data);
    } catch (err) {
      console.warn("Failed to fetch states from API, falling back to static list.", err);
      const fallback = Object.keys(staticLocationData).map((k) => ({ name: capitalizeWords(k), value: k }));
      populateStateOptions(fallback);
      if (locationError) {
        locationError.textContent = "Using offline state list (API unreachable).";
        locationError.style.display = "block";
      }
    }
  }

  function populateStateOptions(statesArray) {
    clearSelect(stateSelect, "-- Choose your state --");
    statesArray.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.value ?? s.name.toLowerCase();
      opt.textContent = s.name;
      stateSelect.appendChild(opt);
    });
  }

  async function loadDistricts(state) {
    clearSelect(districtSelect, "-- Select district --");
    clearSelect(villageSelect, "-- Select village --");
    districtSelect.disabled = true;
    villageSelect.disabled = true;
    getWeatherBtn.disabled = true;

    if (!state) return;

    // Try API first
    try {
      const data = await fetchJson(`${BASE_URL}/api/districts?state=${encodeURIComponent(state)}`);
      data.forEach((d) => {
        const opt = document.createElement("option");
        opt.value = d.value ?? d.name;
        opt.textContent = d.name;
        districtSelect.appendChild(opt);
      });
      districtSelect.disabled = false;
    } catch (err) {
      console.warn("Failed to load districts from API, falling back to static.", err);
      // fallback
      const lower = state.toLowerCase();
      if (staticLocationData[lower]) {
        Object.keys(staticLocationData[lower]).forEach((district) => {
          const opt = document.createElement("option");
          opt.value = district;
          opt.textContent = capitalizeWords(district);
          districtSelect.appendChild(opt);
        });
        districtSelect.disabled = false;
      }
      if (locationError) {
        locationError.textContent = "Using offline district list for selected state."; 
        locationError.style.display = "block";
      }
    }
  }

  async function loadVillages(state, district) {
    clearSelect(villageSelect, "-- Select village --");
    villageSelect.disabled = true;
    getWeatherBtn.disabled = true;

    if (!state || !district) return;

    // Try API first
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
      console.warn("Failed to load villages from API, falling back to static.", err);
      const sl = state.toLowerCase();
      const dl = district.toLowerCase();
      if (staticLocationData[sl] && staticLocationData[sl][dl]) {
        staticLocationData[sl][dl].forEach((village) => {
          const opt = document.createElement("option");
          opt.value = village;
          opt.textContent = village;
          villageSelect.appendChild(opt);
        });
        villageSelect.disabled = false;
      }
      if (locationError) {
        locationError.textContent = "Using offline village list for selected district.";
        locationError.style.display = "block";
      }
    }
  }

  async function fetchWeatherFromAPI(state, district, village) {
    const payload = await fetchJson(
      `${BASE_URL}/api/weather?state=${encodeURIComponent(state)}&district=${encodeURIComponent(
        district
      )}&village=${encodeURIComponent(village)}`
    );
    return payload;
  }

  function generateDummyWeather(state, district, village) {
    const today = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daily = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      daily.push({
        date: d.toISOString().slice(0, 10),
        day: days[d.getDay()],
        temp: { min: 23 + (i % 3), max: 30 + (i % 4) },
        condition: i % 3 === 0 ? "Sunny" : i % 3 === 1 ? "Cloudy" : "Rainy",
        precipitation: i % 3 === 2 ? 60 : 10,
        humidity: 50 + i,
        wind: 8 + i,
      });
    }
    return {
      location: `${capitalizeWords(village)}, ${capitalizeWords(district)}, ${capitalizeWords(state)}`,
      daily,
      advisory: [
        { title: "Irrigation", text: "Suspend irrigation on rainy days; monitor soil moisture." },
        { title: "Pest Alert", text: "Higher humidity could promote fungal pests; inspect leaves." },
        { title: "Harvest", text: "Prefer sunny days later in the week for harvesting." },
      ],
    };
  }

  function renderForecast(payload) {
    if (forecastSection) forecastSection.style.display = "block";
    if (selectedLocationP) selectedLocationP.textContent = payload.location || "--";

    // Daily
    if (forecastCards) {
      forecastCards.innerHTML = "";
      if (Array.isArray(payload.daily)) {
        payload.daily.forEach((d) => {
          const card = document.createElement("div");
          card.className = "forecast-card";
          card.innerHTML = `
            <div style="margin-bottom:8px;"><strong>${d.day || ""}</strong> &middot; ${d.date || ""}</div>
            <div style="display:flex; gap:10px; align-items:center;">
              <div style="font-size:28px;">${iconForCondition(d.condition)}</div>
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

    // Advisory
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

  // Wiring events
  stateSelect.addEventListener("change", async () => {
    if (locationError) locationError.style.display = "none";
    const state = normalize(stateSelect.value).toLowerCase();
    await loadDistricts(state);
  });

  districtSelect.addEventListener("change", async () => {
    if (locationError) locationError.style.display = "none";
    const state = normalize(stateSelect.value).toLowerCase();
    const district = normalize(districtSelect.value).toLowerCase();
    await loadVillages(state, district);
  });

  villageSelect.addEventListener("change", () => {
    getWeatherBtn.disabled = !villageSelect.value;
  });

  getWeatherBtn.addEventListener("click", async () => {
    const state = normalize(stateSelect.value).toLowerCase();
    const district = normalize(districtSelect.value).toLowerCase();
    const village = normalize(villageSelect.value);
    if (!state || !district || !village) {
      alert("Please select state, district, and village.");
      return;
    }

    let weatherPayload;
    try {
      weatherPayload = await fetchWeatherFromAPI(state, district, village);
    } catch (err) {
      console.warn("API weather fetch failed, using dummy forecast.", err);
      weatherPayload = generateDummyWeather(state, district, village);
      if (locationError) {
        locationError.textContent = "Showing fallback forecast (API unreachable).";
        locationError.style.display = "block";
      }
    }

    renderForecast(weatherPayload);
  });

  // Kick off initial state load
  loadStates();
});
