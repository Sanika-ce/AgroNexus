// weather.js

const API_ID = "1bc2c747c9b88ec10a9c4c4db4c29b3a";
// Replace with your real API base URL
const BASE_URL = "https://your-api.example.com";

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

// Static cascading lookup
const locationData = {
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

document.addEventListener("DOMContentLoaded", function () {
  const stateSelect = document.getElementById("state");
  const districtSelect = document.getElementById("district");
  const villageSelect = document.getElementById("village");
  const getWeatherBtn = document.getElementById("getWeatherBtn");
  const forecastSection = document.getElementById("forecastSection");
  const selectedLocationP = document.getElementById("selectedLocation");
  const forecastCards = document.getElementById("forecastCards");
  const advisoryGrid = document.getElementById("advisoryGrid");
  const advisorySummary = document.getElementById("advisorySummary");
  const locationError = document.getElementById("locationError");

  function normalize(str) {
    return String(str).trim().toLowerCase();
  }

  function capitalizeWords(str) {
    return str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  // Populate districts when state changes
  stateSelect.addEventListener("change", () => {
    const stateKey = normalize(stateSelect.value);
    districtSelect.innerHTML = "<option value=''>-- Select district --</option>";
    villageSelect.innerHTML = "<option value=''>-- Select village --</option>";
    districtSelect.disabled = true;
    villageSelect.disabled = true;
    getWeatherBtn.disabled = true;

    if (stateKey && locationData[stateKey]) {
      const districts = Object.keys(locationData[stateKey]);
      districts.forEach((d) => {
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = capitalizeWords(d);
        districtSelect.appendChild(opt);
      });
      districtSelect.disabled = false;
    }
  });

  // Populate villages when district changes
  districtSelect.addEventListener("change", () => {
    const stateKey = normalize(stateSelect.value);
    const districtKey = normalize(districtSelect.value);
    villageSelect.innerHTML = "<option value=''>-- Select village --</option>";
    villageSelect.disabled = true;
    getWeatherBtn.disabled = true;

    if (stateKey && districtKey && locationData[stateKey] && locationData[stateKey][districtKey]) {
      locationData[stateKey][districtKey].forEach((v) => {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        villageSelect.appendChild(opt);
      });
      villageSelect.disabled = false;
    }
  });

  villageSelect.addEventListener("change", () => {
    getWeatherBtn.disabled = !villageSelect.value;
  });

  // Fetch weather (stub + real call)
  getWeatherBtn.addEventListener("click", async () => {
    const state = normalize(stateSelect.value);
    const district = normalize(districtSelect.value);
    const village = villageSelect.value;

    if (!state || !district || !village) {
      alert("Please select state, district, and village.");
      return;
    }

    try {
      // Example real call - adjust endpoint & params to your API spec
      const payload = await fetchJson(
        `${BASE_URL}/api/weather?state=${encodeURIComponent(state)}&district=${encodeURIComponent(
          district
        )}&village=${encodeURIComponent(village)}`
      );
      renderForecast(payload);
    } catch (err) {
      console.warn("Falling back to dummy forecast:", err);
      // Fallback dummy data if API fails
      const dummy = {
        location: `${capitalizeWords(village)}, ${capitalizeWords(district)}, ${capitalizeWords(state)}`,
        daily: [
          {
            date: "2025-08-03",
            day: "Sun",
            temp: { min: 25, max: 33 },
            condition: "Sunny",
            precipitation: 10,
            humidity: 55,
            wind: 12,
          },
          {
            date: "2025-08-04",
            day: "Mon",
            temp: { min: 24, max: 31 },
            condition: "Partly Cloudy",
            precipitation: 5,
            humidity: 60,
            wind: 10,
          },
        ],
        advisory: [
          { title: "Irrigation", text: "Skip irrigation tomorrow; light rain expected." },
          { title: "Pest Watch", text: "Moderate humidity—check for fungal issues." },
        ],
      };
      renderForecast(dummy);
    }
  });

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
    forecastSection.classList.remove("hidden");
    selectedLocationP.textContent = payload.location || "--";

    // Daily forecast cards
    forecastCards.innerHTML = "";
    if (Array.isArray(payload.daily)) {
      payload.daily.forEach((d) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <div style="margin-bottom:8px;">
            <strong>${d.day || ""}</strong> &middot; ${d.date || ""}
          </div>
          <div style="display:flex; gap:12px; align-items:center;">
            <div style="font-size:32px;">${iconForCondition(d.condition)}</div>
            <div>
              <div style="font-weight:600;">${d.condition || ""}</div>
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

    // Advisory
    advisoryGrid.innerHTML = "";
    if (Array.isArray(payload.advisory)) {
      payload.advisory.forEach((a) => {
        const ad = document.createElement("div");
        ad.className = "card";
        ad.innerHTML = `
          <h4 style="margin-bottom:6px;">${a.title}</h4>
          <p style="margin:0;">${a.text}</p>
        `;
        advisoryGrid.appendChild(ad);
      });
    }
  }
});
