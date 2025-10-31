const locationData = {
  Maharashtra: {
    Pune: ["Hadapsar", "Shirur", "Baramati"],
    Nagpur: ["Umred", "Hingna", "Katol"]
  },
  Karnataka: {
    Bengaluru: ["Yelahanka", "Anekal", "Hoskote"],
    Mysuru: ["Nanjangud", "Hunsur", "T. Narasipura"]
  },
  Gujarat: {
    Ahmedabad: ["Dholka", "Sanand", "Viramgam"],
    Surat: ["Bardoli", "Olpad", "Kamrej"]
  },
  Punjab: {
    Ludhiana: ["Sahnewal", "Raikot", "Dehlon"],
    Amritsar: ["Ajnala", "Attari", "Majitha"]
  }
};

const coordinates = {
  Hadapsar: { lat: 18.5089, lon: 73.9211 },
  Shirur: { lat: 18.8278, lon: 74.3740 },
  Baramati: { lat: 18.1510, lon: 74.5768 },
  Umred: { lat: 20.8502, lon: 79.3254 },
  Hunsur: { lat: 12.3035, lon: 76.2921 },
  Dholka: { lat: 22.7224, lon: 72.4410 },
  Sahnewal: { lat: 30.8443, lon: 76.0532 },
  Ajnala: { lat: 31.5787, lon: 74.7546 }
};

const stateSelect = document.getElementById("state-select");
const districtSelect = document.getElementById("district-select");
const villageSelect = document.getElementById("village-select");
const getWeatherBtn = document.getElementById("get-weather-btn");
const weatherResult = document.getElementById("weather-result");

stateSelect.addEventListener("change", () => {
  const state = stateSelect.value;
  districtSelect.innerHTML = `<option value="">Select District</option>`;
  villageSelect.innerHTML = `<option value="">Select Village</option>`;
  villageSelect.disabled = true;

  if (state && locationData[state]) {
    Object.keys(locationData[state]).forEach(district => {
      districtSelect.innerHTML += `<option value="${district}">${district}</option>`;
    });
  }
});

districtSelect.addEventListener("change", () => {
  const state = stateSelect.value;
  const district = districtSelect.value;
  villageSelect.innerHTML = `<option value="">Select Village</option>`;

  if (state && district && locationData[state][district]) {
    locationData[state][district].forEach(village => {
      villageSelect.innerHTML += `<option value="${village}">${village}</option>`;
    });
    villageSelect.disabled = false;
  } else {
    villageSelect.disabled = true;
  }
});

// 🔥 Weather API Logic
getWeatherBtn.addEventListener("click", () => {
  const village = villageSelect.value;
  if (!village || !coordinates[village]) {
    alert("Please select a valid village with coordinates.");
    return;
  }

  const { lat, lon } = coordinates[village];
  const apiKey = "YOUR_OPENWEATHER_API_KEY"; // Replace this with your real key

  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=7&appid=${apiKey}`
  )
    .then(res => res.json())
    .then(data => {
      displayWeather(data);
    })
    .catch(err => {
      console.error(err);
      weatherResult.innerHTML = `<p>Error fetching weather data</p>`;
    });
});

function displayWeather(data) {
  if (!data.list) {
    weatherResult.innerHTML = "<p>No forecast data available.</p>";
    return;
  }

  let html = `<h3>Weather Forecast for Next 7 Time Slots (3-hour intervals):</h3>`;
  html += `<ul>`;
  data.list.forEach(item => {
    const date = new Date(item.dt_txt);
    html += `<li><strong>${date.toLocaleString()}</strong> - ${item.weather[0].main}, ${item.main.temp}°C</li>`;
  });
  html += `</ul>`;
  weatherResult.innerHTML = html;
}
