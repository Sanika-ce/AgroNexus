// Sample location data
const locations = {
    "Maharashtra": {
        "Pune": [
            { name: "Alandi", lat: 18.678, lon: 73.902 },
            { name: "Baramati", lat: 18.151, lon: 74.579 },
            { name: "Junnar", lat: 19.208, lon: 73.875 }
        ],
        "Nashik": [
            { name: "Igatpuri", lat: 19.695, lon: 73.556 },
            { name: "Sinnar", lat: 19.845, lon: 73.999 },
            { name: "Dindori", lat: 20.202, lon: 73.839 }
        ],
        "Satara": [
            { name: "Wai", lat: 17.952, lon: 73.891 },
            { name: "Patan", lat: 17.375, lon: 73.901 },
            { name: "Karad", lat: 17.289, lon: 74.182 }
        ]
    },
    "Karnataka": {
        "Bengaluru": [
            { name: "Anekal", lat: 12.708, lon: 77.696 },
            { name: "Devanahalli", lat: 13.247, lon: 77.712 },
            { name: "Hosakote", lat: 13.071, lon: 77.798 }
        ],
        "Mysuru": [
            { name: "Hunsur", lat: 12.307, lon: 76.287 },
            { name: "Nanjangud", lat: 12.117, lon: 76.682 },
            { name: "Piriyapatna", lat: 12.335, lon: 76.101 }
        ]
    },
    "Gujarat": {
        "Ahmedabad": [
            { name: "Dholka", lat: 22.727, lon: 72.441 },
            { name: "Viramgam", lat: 23.120, lon: 72.038 },
            { name: "Sanand", lat: 22.992, lon: 72.381 }
        ],
        "Surat": [
            { name: "Bardoli", lat: 21.123, lon: 73.112 },
            { name: "Vyara", lat: 21.110, lon: 73.394 },
            { name: "Navsari", lat: 20.950, lon: 72.920 }
        ]
    },
    "Punjab": {
        "Ludhiana": [
            { name: "Jagraon", lat: 30.787, lon: 75.474 },
            { name: "Khanna", lat: 30.705, lon: 76.221 },
            { name: "Samrala", lat: 30.836, lon: 76.193 }
        ],
        "Amritsar": [
            { name: "Tarn Taran", lat: 31.450, lon: 74.927 },
            { name: "Ajnala", lat: 31.842, lon: 74.760 },
            { name: "Majitha", lat: 31.757, lon: 74.956 }
        ]
    }
};

// DOM Elements
const stateSelect = document.getElementById('state-select');
const districtSelect = document.getElementById('district-select');
const villageSelect = document.getElementById('village-select');
const getWeatherBtn = document.getElementById('get-weather-btn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const currentWeather = document.getElementById('current-weather');
const forecastCards = document.getElementById('forecast-cards');

// Weather icon mapping
const weatherIcons = {
    '01d': 'fas fa-sun',          // clear sky (day)
    '01n': 'fas fa-moon',         // clear sky (night)
    '02d': 'fas fa-cloud-sun',    // few clouds (day)
    '02n': 'fas fa-cloud-moon',   // few clouds (night)
    '03d': 'fas fa-cloud',        // scattered clouds
    '03n': 'fas fa-cloud',
    '04d': 'fas fa-cloud',        // broken clouds
    '04n': 'fas fa-cloud',
    '09d': 'fas fa-cloud-rain',   // shower rain
    '09n': 'fas fa-cloud-rain',
    '10d': 'fas fa-cloud-sun-rain', // rain (day)
    '10n': 'fas fa-cloud-moon-rain',// rain (night)
    '11d': 'fas fa-bolt',         // thunderstorm
    '11n': 'fas fa-bolt',
    '13d': 'fas fa-snowflake',    // snow
    '13n': 'fas fa-snowflake',
    '50d': 'fas fa-smog',         // mist
    '50n': 'fas fa-smog'
};

// Weather class mapping
const weatherClasses = {
    'Clear': 'sunny',
    'Clouds': 'cloudy',
    'Rain': 'rainy',
    'Drizzle': 'rainy',
    'Thunderstorm': 'stormy',
    'Snow': 'rainy',
    'Mist': 'cloudy',
    'Haze': 'cloudy',
    'Fog': 'cloudy'
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
    
    // Populate states
    Object.keys(locations).forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });
    
    // Set default state to Maharashtra
    stateSelect.value = "Maharashtra";
    stateSelect.dispatchEvent(new Event('change'));
    
    // Add event listeners
    stateSelect.addEventListener('change', updateDistricts);
    districtSelect.addEventListener('change', updateVillages);
    getWeatherBtn.addEventListener('click', getWeather);
});

// Update districts based on selected state
function updateDistricts() {
    const selectedState = stateSelect.value;
    districtSelect.innerHTML = '<option value="">Select District</option>';
    
    if (selectedState && locations[selectedState]) {
        Object.keys(locations[selectedState]).forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
        
        // Set default district to Pune
        setTimeout(() => {
            districtSelect.value = "Pune";
            districtSelect.dispatchEvent(new Event('change'));
        }, 100);
    } else {
        villageSelect.disabled = true;
        villageSelect.innerHTML = '<option value="">Select Village</option>';
    }
}

// Update villages based on selected district
function updateVillages() {
    const selectedState = stateSelect.value;
    const selectedDistrict = districtSelect.value;
    villageSelect.innerHTML = '<option value="">Select Village</option>';
    
    if (selectedState && selectedDistrict && locations[selectedState][selectedDistrict]) {
        villageSelect.disabled = false;
        locations[selectedState][selectedDistrict].forEach(village => {
            const option = document.createElement('option');
            option.value = village.name;
            option.textContent = village.name;
            option.setAttribute('data-lat', village.lat);
            option.setAttribute('data-lon', village.lon);
            villageSelect.appendChild(option);
        });
        
        // Set default village to first in list
        setTimeout(() => {
            villageSelect.selectedIndex = 1;
        }, 100);
    } else {
        villageSelect.disabled = true;
    }
}

// Get weather data
async function getWeather() {
    const selectedVillage = villageSelect.options[villageSelect.selectedIndex];
    const lat = selectedVillage.getAttribute('data-lat');
    const lon = selectedVillage.getAttribute('data-lon');
    
    if (!lat || !lon) {
        showError('Please select a valid location');
        return;
    }
    
    // Show loading state
    loading.style.display = 'block';
    error.style.display = 'none';
    currentWeather.style.display = 'none';
    forecastCards.innerHTML = '';
    
    // API configuration
    const apiKey = '1bc2c747c9b88ec10a9c4c4db4c29b3a'; // Replace with your actual API key
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.cod === "200") {
            displayWeather(data);
        } else {
            showError('Error loading weather data. Please try again.');
        }
    } catch (err) {
        console.error('Error fetching weather data:', err);
        showError('Failed to load weather data. Please try again later.');
    } finally {
        loading.style.display = 'none';
    }
}

// Display weather data
function displayWeather(data) {
    // Update location
    const location = `${villageSelect.value}, ${districtSelect.value}, ${stateSelect.value}`;
    document.getElementById('current-location').textContent = location;
    
    // Current weather
    const current = data.list[0];
    const currentDate = new Date(current.dt * 1000);
    
    document.getElementById('current-date').textContent = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('current-temp').textContent = `${Math.round(current.main.temp)}°C`;
    document.getElementById('feels-like').textContent = `${Math.round(current.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${current.main.humidity}%`;
    
    const currentIconCode = current.weather[0].icon;
    document.getElementById('current-icon').innerHTML = `<i class="${weatherIcons[currentIconCode]}"></i>`;
    document.getElementById('current-description').textContent = current.weather[0].description;
    
    // Weather details
    document.getElementById('wind-speed').textContent = `${(current.wind.speed * 3.6).toFixed(1)} km/h`;
    document.getElementById('precipitation').textContent = current.rain ? `${current.rain['3h'] || 0} mm` : '0 mm';
    document.getElementById('clouds').textContent = `${current.clouds.all}%`;
    document.getElementById('pressure').textContent = `${current.main.pressure} hPa`;
    
    // Sun times
    const sunrise = new Date(data.city.sunrise * 1000);
    const sunset = new Date(data.city.sunset * 1000);
    
    document.getElementById('sunrise').textContent = sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('sunset').textContent = sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Show current weather
    currentWeather.style.display = 'block';
    
    // Display forecast
    forecastCards.innerHTML = '';
    
    // Group by day
    const dailyForecast = {};
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateString = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        
        if (!dailyForecast[dateString]) {
            dailyForecast[dateString] = {
                date: dateString,
                temps: [],
                conditions: []
            };
        }
        
        dailyForecast[dateString].temps.push(item.main.temp);
        dailyForecast[dateString].conditions.push(item.weather[0].main);
    });
    
    // Get next 4 days
    const next4Days = Object.values(dailyForecast).slice(1, 5);
    
    next4Days.forEach(day => {
        // Calculate average temp
        const avgTemp = (day.temps.reduce((a, b) => a + b, 0) / day.temps.length).toFixed(1);
        
        // Determine most common condition
        const conditionCounts = {};
        day.conditions.forEach(condition => {
            conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
        });
        const mostCommonCondition = Object.keys(conditionCounts).reduce((a, b) => 
            conditionCounts[a] > conditionCounts[b] ? a : b
        );
        
        // Get icon
        const conditionIcon = weatherIcons[mostCommonCondition === 'Clear' ? '01d' : 
                            mostCommonCondition === 'Clouds' ? '03d' : 
                            mostCommonCondition === 'Rain' ? '10d' : 
                            mostCommonCondition === 'Thunderstorm' ? '11d' : '50d'];
        
        // Get weather class
        const weatherClass = weatherClasses[mostCommonCondition] || 'cloudy';
        
        const card = document.createElement('div');
        card.classList.add('forecast-card', weatherClass);
        card.innerHTML = `
            <div class="forecast-date">${day.date}</div>
            <div class="forecast-icon"><i class="${conditionIcon}"></i></div>
            <div class="forecast-temp">${avgTemp}°C</div>
            <div class="forecast-desc">${mostCommonCondition}</div>
            <div class="forecast-details">
                <div>
                    <i class="fas fa-temperature-high"></i>
                    <span>${Math.max(...day.temps).toFixed(1)}°C</span>
                </div>
                <div>
                    <i class="fas fa-temperature-low"></i>
                    <span>${Math.min(...day.temps).toFixed(1)}°C</span>
                </div>
            </div>
        `;
        
        forecastCards.appendChild(card);
    });
}

// Show error message
function showError(message) {
    error.style.display = 'block';
    errorMessage.textContent = message;
}


const locations = {
            "Maharashtra": {
                "Pune": [
                    { name: "Alandi", lat: 18.678, lon: 73.902 },
                    { name: "Baramati", lat: 18.151, lon: 74.579 },
                    { name: "Junnar", lat: 19.208, lon: 73.875 }
                ],
                "Nashik": [
                    { name: "Igatpuri", lat: 19.695, lon: 73.556 },
                    { name: "Sinnar", lat: 19.845, lon: 73.999 },
                    { name: "Dindori", lat: 20.202, lon: 73.839 }
                ],
                "Satara": [
                    { name: "Wai", lat: 17.952, lon: 73.891 },
                    { name: "Patan", lat: 17.375, lon: 73.901 },
                    { name: "Karad", lat: 17.289, lon: 74.182 }
                ]
            },
            "Karnataka": {
                "Bengaluru": [
                    { name: "Anekal", lat: 12.708, lon: 77.696 },
                    { name: "Devanahalli", lat: 13.247, lon: 77.712 },
                    { name: "Hosakote", lat: 13.071, lon: 77.798 }
                ],
                "Mysuru": [
                    { name: "Hunsur", lat: 12.307, lon: 76.287 },
                    { name: "Nanjangud", lat: 12.117, lon: 76.682 },
                    { name: "Piriyapatna", lat: 12.335, lon: 76.101 }
                ]
            },
            "Gujarat": {
                "Ahmedabad": [
                    { name: "Dholka", lat: 22.727, lon: 72.441 },
                    { name: "Viramgam", lat: 23.120, lon: 72.038 },
                    { name: "Sanand", lat: 22.992, lon: 72.381 }
                ],
                "Surat": [
                    { name: "Bardoli", lat: 21.123, lon: 73.112 },
                    { name: "Olpad", lat: 21.336, lon: 72.751 },
                    { name: "Kamrej", lat: 21.296, lon: 72.962 }
                ]
            }
        };

        // Get DOM elements
        const stateSelect = document.getElementById('state-select');
        const districtSelect = document.getElementById('district-select');
        const villageSelect = document.getElementById('village-select');

        // Populate states on page load
        Object.keys(locations).forEach(state => {
            stateSelect.appendChild(new Option(state, state));
        });

        // State change handler
        stateSelect.addEventListener('change', function() {
            // Reset districts and villages
            districtSelect.innerHTML = '<option value="">Select District</option>';
            villageSelect.innerHTML = '<option value="">Select Village</option>';
            villageSelect.disabled = true;
            
            if (!this.value) {
                districtSelect.disabled = true;
                return;
            }
            
            // Enable and populate districts
            districtSelect.disabled = false;
            Object.keys(locations[this.value]).forEach(district => {
                districtSelect.appendChild(new Option(district, district));
            });
        });

        // District change handler
        districtSelect.addEventListener('change', function() {
            // Reset villages
            villageSelect.innerHTML = '<option value="">Select Village</option>';
            
            if (!this.value) {
                villageSelect.disabled = true;
                return;
            }
            
            // Enable and populate villages
            villageSelect.disabled = false;
            const state = stateSelect.value;
            const district = this.value;
            
            locations[state][district].forEach(village => {
                const option = new Option(village.name, village.name);
                // Store coordinates as data attributes
                option.dataset.lat = village.lat;
                option.dataset.lon = village.lon;
                villageSelect.appendChild(option);
            });
        });

        // Village change handler (example usage)
        villageSelect.addEventListener('change', function() {
            if (!this.value) return;
            
            const selectedOption = this.options[this.selectedIndex];
            const lat = selectedOption.dataset.lat;
            const lon = selectedOption.dataset.lon;
            
            console.log(`Selected: ${this.value} | Coordinates: (${lat}, ${lon})`);
            // You can use the coordinates for mapping or other purposes
        });