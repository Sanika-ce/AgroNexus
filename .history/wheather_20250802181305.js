// Static cascading data (state → district → villages)
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

document.addEventListener("DOMContentLoaded", () => {
  const stateEl = document.getElementById("state");
  const districtEl = document.getElementById("district");
  const villageEl = document.getElementById("village");
  const getWeatherBtn = document.getElementById("getWeatherBtn");
  const forecastSection = document.getElementById("forecastSection");
  const selectedLocationP = document.getElementById("selectedLocation");
  const forecastCards = document.getElementById("forecastCards");
  const advisoryGrid = document.getElementById("advisoryGrid");
  const advisorySummary = document.getElementById("advisorySummary");

  function capitalize(word) {
    return word
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  function clearSelect(sel, placeholder) {
    sel.innerHTML = "";
    const o = document.createElement("option");
    o.value = "";
    o.textContent = placeholder;
    sel.appendChild(o);
  }

  stateEl.addEventListener("change", () => {
    const state = stateEl.value.toLowerCase();
    clearSelect(districtEl, "-- Select district --");
    clearSelect(villageEl, "-- Select village --");
    districtEl.disabled = true;
    villageEl.disabled = true;
    getWeatherBtn.disabled = true;

    if (state && locationData[state]) {
      Object.keys(locationData[state]).forEach((district) => {
        const opt = document.createElement("option");
        opt.value = district;
        opt.textContent = capitalize(district);
        districtEl.appendChild(opt);
      });
      districtEl.disabled = false;
    }
  });

  districtEl.addEventListener("change", () => {
    const state = stateEl.value.toLowerCase();
    const district = districtEl.value.toLowerCase();
    clearSelect(villageEl, "-- Select village --");
    villageEl.disabled = true;
    getWeatherBtn.disabled = true;

    if (state && district && locationData[state] && locationData[state][district]) {
      locationData[state][district].forEach((v) => {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        villageEl.appendChild(opt);
      });
      villageEl.disabled = false;
    }
  });

  villageEl.addEventListener("change", () => {
    getWeatherBtn.disabled = !villageEl.value;
  });

  getWeatherBtn.addEventListener("click", () => {
    const state = stateEl.value;
    const district = districtEl.value;
    const village = villageEl.value;
    if (!state || !district || !village) {
      alert("Please select state, district, and village.");
      return;
    }

    // Show dummy forecast
    const locationString = `${capitalize(village)}, ${capitalize(district)}, ${capitalize(state)}`;
    selectedLocationP.textContent = locationString;
    forecastSection.classList.remove("hidden");

    const today = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dummyDaily = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dummyDaily.push({
        date: d.toISOString().slice(0, 10),
        day: days[d.getDay()],
        temp: { min: 22 + i % 3, max: 30 + (i % 4) },
        condition: i % 3 === 0 ? "Sunny" : i % 3 === 1 ? "Partly Cloudy" : "Rainy",
        precipitation: i % 3 === 2 ? 60 : 10,
        humidity: 50 + i,
        wind: 8 + i,
      });
    }

    // Render forecast cards
    forecastCards.innerHTML = "";
    dummyDaily.forEach((d) => {
      const card = document.createElement("div");
      card.className = "forecast-card";
      card.innerHTML = `
        <div style="margin-bottom:8px;">
          <strong>${d.day}</strong> &middot; ${d.date}
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <div style="font-size:28px;">${iconForCondition(d.condition)}</div>
          <div>
            <div style="font-weight:600;">${d.condition}</div>
            <div>${d.temp.max}° / ${d.temp.min}°</div>
            <div style="font-size:12px; margin-top:4px;">
              Precip: ${d.precipitation}% | Humidity: ${d.humidity}% | Wind: ${d.wind} km/h
            </div>
          </div>
        </div>
      `;
      forecastCards.appendChild(card);
    });

    // Advisory
    advisoryGrid.innerHTML = "";
    const advices = [
      { title: "Irrigation", text: "Skip irrigation on rainy days. Monitor soil moisture." },
      { title: "Pest Alert", text: "High humidity may encourage fungal growth; inspect crops." },
      { title: "Harvest Timing", text: "Sunny days later in the week are ideal for harvesting." },
    ];
    advices.fo
