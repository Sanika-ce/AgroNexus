
        // Weather Forecast Implementation
        // Sample data - in a real application, this would come from a database or API
        const locations = {
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
            "Nagpur": [
                { name: "Katol", lat: 21.273, lon: 78.586 },
                { name: "Umred", lat: 20.854, lon: 79.324 },
                { name: "Ramtek", lat: 21.395, lon: 79.327 }
            ],
            "Satara": [
                { name: "Wai", lat: 17.952, lon: 73.891 },
                { name: "Patan", lat: 17.375, lon: 73.901 },
                { name: "Karad", lat: 17.289, lon: 74.182 }
            ]
        };

        // Populate district dropdown
        const districtSelect = document.getElementById('district-select');
        const villageSelect = document.getElementById('village-select');
        const weatherDisplay = document.getElementById('weather-display');

        // Populate districts
        Object.keys(locations).forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });

        // Update villages when district changes
        districtSelect.addEventListener('change', function() {
            const selectedDistrict = this.value;
            villageSelect.innerHTML = '<option value="">Select Village</option>';
            
            if (selectedDistrict) {
                villageSelect.disabled = false;
                locations[selectedDistrict].forEach(village => {
                    const option = document.createElement('option');
                    option.value = village.name;
                    option.textContent = village.name;
                    option.setAttribute('data-lat', village.lat);
                    option.setAttribute('data-lon', village.lon);
                    villageSelect.appendChild(option);
                });
            } else {
                villageSelect.disabled = true;
                weatherDisplay.innerHTML = 'Select your district and village to see weather forecast';
            }
        });

        // Get weather when village is selected
        villageSelect.addEventListener('change', function() {
            const selectedVillage = this.options[this.selectedIndex];
            const lat = selectedVillage.getAttribute('data-lat');
            const lon = selectedVillage.getAttribute('data-lon');
            
            if (lat && lon) {
                getWeather(lat, lon);
            }
        });

        // Weather icons mapping
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

        // Weather class mapping for colors
        const weatherClasses = {
            'Clear': 'sunny',
            'Clouds': 'cloudy',
            'Rain': 'rainy',
            'Drizzle': 'rainy',
            'Thunderstorm': 'stormy'
        };

        // Get weather data from OpenWeatherMap
        async function getWeather(lat, lon) {
            const apiKey = '1bc2c747c9b88ec10a9c4c4db4c29b3a'; // Replace with your actual API key
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
            
            weatherDisplay.innerHTML = '<div class="loading">Loading weather data...</div>';
            
            try {
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.cod === "200") {
                    displayWeather(data);
                } else {
                    weatherDisplay.innerHTML = '<div class="error">Error loading weather data. Please try again.</div>';
                }
            } catch (error) {
                console.error('Error fetching weather data:', error);
                weatherDisplay.innerHTML = '<div class="error">Failed to load weather data. Please try again later.</div>';
            }
        }

        // Display weather forecast
        function displayWeather(data) {
            // Group by day
            const dailyForecast = {};
            
            data.list.forEach(item => {
                const date = new Date(item.dt * 1000);
                const dateString = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                
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
            const next4Days = Object.values(dailyForecast).slice(0, 4);
            
            // Generate HTML for weather display
            let weatherHTML = '<div class="weather-forecast">';
            
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
                                    mostCommonCondition === 'Rain' ? '10d' : '13d'];
                
                weatherHTML += `
                    <div class="weather-day">
                        <div class="weather-icon-small"><i class="${conditionIcon}"></i></div>
                        <div class="weather-date">${day.date}</div>
                        <div class="weather-temp">${avgTemp}°C</div>
                        <div class="weather-desc">${mostCommonCondition}</div>
                    </div>
                `;
            });
            
            weatherHTML += '</div>';
            weatherDisplay.innerHTML = weatherHTML;
        }

        // Initialize with Pune as default district
        window.addEventListener('DOMContentLoaded', () => {
            districtSelect.value = "Pune";
            districtSelect.dispatchEvent(new Event('change'));
        });