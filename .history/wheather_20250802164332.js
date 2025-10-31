document.addEventListener('DOMContentLoaded', function() {
            // Sample data for Indian states, districts, and villages
            const locations = {
                maharashtra: {
                    name: "Maharashtra",
                    districts: {
                        nashik: { 
                            name: "Nashik",
                            villages: ["Igatpuri", "Sinnar", "Dindori", "Peth"]
                        },
                        pune: {
                            name: "Pune",
                            villages: ["Baramati", "Junnar", "Ambegaon", "Bhor"]
                        },
                        nagpur: {
                            name: "Nagpur",
                            villages: ["Katol", "Narkhed", "Kalmeshwar", "Umred"]
                        }
                    }
                },
                punjab: {
                    name: "Punjab",
                    districts: {
                        ludhiana: {
                            name: "Ludhiana",
                            villages: ["Jagraon", "Raikot", "Doraha", "Samrala"]
                        },
                        amritsar: {
                            name: "Amritsar",
                            villages: ["Ajnala", "Majitha", "Tarn Taran", "Patti"]
                        },
                        patiala: {
                            name: "Patiala",
                            villages: ["Rajpura", "Samana", "Nabha", "Patran"]
                        }
                    }
                },
                gujarat: {
                    name: "Gujarat",
                    districts: {
                        ahmedabad: {
                            name: "Ahmedabad",
                            villages: ["Dholka", "Viramgam", "Sanand", "Detroj"]
                        },
                        surat: {
                            name: "Surat",
                            villages: ["Bardoli", "Chorasi", "Palsana", "Kamrej"]
                        },
                        vadodara: {
                            name: "Vadodara",
                            villages: ["Karjan", "Dabhoi", "Padra", "Savli"]
                        }
                    }
                },
                tamilnadu: {
                    name: "Tamil Nadu",
                    districts: {
                        coimbatore: {
                            name: "Coimbatore",
                            villages: ["Pollachi", "Mettupalayam", "Sulur", "Annur"]
                        },
                        thanjavur: {
                            name: "Thanjavur",
                            villages: ["Kumbakonam", "Papanasam", "Orathanadu", "Pattukkottai"]
                        },
                        madurai: {
                            name: "Madurai",
                            villages: ["Melur", "Vadipatti", "Usilampatti", "Thirumangalam"]
                        }
                    }
                }
            };

            // DOM elements
            const stateSelect = document.getElementById('state');
            const districtSelect = document.getElementById('district');
            const villageSelect = document.getElementById('village');
            const getWeatherBtn = document.getElementById('getWeatherBtn');
            const forecastSection = document.getElementById('forecastSection');
            const forecastCards = document.querySelector('.forecast-cards');
            const locationInfo = document.getElementById('selectedLocation');
            const advisoryText = document.getElementById('advisoryText');

            // State selection change event
            stateSelect.addEventListener('change', function() {
                const state = stateSelect.value;
                districtSelect.innerHTML = '<option value="">-- Select district --</option>';
                villageSelect.innerHTML = '<option value="">-- Select village --</option>';
                
                if (state && locations[state]) {
                    const districts = locations[state].districts;
                    for (const key in districts) {
                        const option = document.createElement('option');
                        option.value = key;
                        option.textContent = districts[key].name;
                        districtSelect.appendChild(option);
                    }
                }
            });

            // District selection change event
            districtSelect.addEventListener('change', function() {
                const state = stateSelect.value;
                const district = districtSelect.value;
                villageSelect.innerHTML = '<option value="">-- Select village --</option>';
                
                if (state && district && locations[state] && locations[state].districts[district]) {
                    const villages = locations[state].districts[district].villages;
                    villages.forEach(village => {
                        const option = document.createElement('option');
                        option.value = village.toLowerCase().replace(/\s+/g, '-');
                        option.textContent = village;
                        villageSelect.appendChild(option);
                    });
                }
            });

            // Weather forecast data
            const forecastData = [
                {
                    date: "August 5, 2025",
                    day: "Monday",
                    icon: "fa-sun",
                    temp: "32°C",
                    condition: "Sunny",
                    wind: "8 km/h",
                    humidity: "45%",
                    rain: "0%"
                },
                {
                    date: "August 6, 2025",
                    day: "Tuesday",
                    icon: "fa-cloud-sun",
                    temp: "30°C",
                    condition: "Partly Cloudy",
                    wind: "10 km/h",
                    humidity: "55%",
                    rain: "10%"
                },
                {
                    date: "August 7, 2025",
                    day: "Wednesday",
                    icon: "fa-cloud",
                    temp: "28°C",
                    condition: "Cloudy",
                    wind: "12 km/h",
                    humidity: "65%",
                    rain: "30%"
                },
                {
                    date: "August 8, 2025",
                    day: "Thursday",
                    icon: "fa-cloud-showers-heavy",
                    temp: "26°C",
                    condition: "Heavy Rain",
                    wind: "15 km/h",
                    humidity: "85%",
                    rain: "90%"
                }
            ];

            // Generate forecast cards
            function generateForecastCards() {
                forecastCards.innerHTML = '';
                
                forecastData.forEach(day => {
                    const card = document.createElement('div');
                    card.className = 'forecast-card';
                    card.innerHTML = `
                        <div class="card-header">
                            <div class="date">${day.date}</div>
                            <div class="day">${day.day}</div>
                        </div>
                        <div class="card-body">
                            <div class="weather-icon">
                                <i class="fas ${day.icon}"></i>
                            </div>
                            <div class="temperature">${day.temp}</div>
                            <div class="weather-condition">${day.condition}</div>
                            
                            <div class="weather-details">
                                <div class="detail">
                                    <i class="fas fa-wind"></i>
                                    <div class="label">Wind</div>
                                    <div class="value">${day.wind}</div>
                                </div>
                                <div class="detail">
                                    <i class="fas fa-tint"></i>
                                    <div class="label">Humidity</div>
                                    <div class="value">${day.humidity}</div>
                                </div>
                                <div class="detail">
                                    <i class="fas fa-cloud-rain"></i>
                                    <div class="label">Rain</div>
                                    <div class="value">${day.rain}</div>
                                </div>
                            </div>
                        </div>
                    `;
                    forecastCards.appendChild(card);
                });
            }

            // Crop advisory based on weather
            function updateAdvisory() {
                const rainProbability = parseInt(forecastData[0].rain);
                
                if (rainProbability > 70) {
                    advisoryText.textContent = "Heavy rainfall expected. Avoid irrigation and ensure proper drainage in fields. Delay harvesting activities until weather clears.";
                } else if (rainProbability > 40) {
                    advisoryText.textContent = "Rain expected. Reduce irrigation and monitor for signs of fungal diseases. Harvest mature crops before rain arrives.";
                } else {
                    advisoryText.textContent = "Dry weather conditions. Schedule irrigation as needed. Good time for harvesting and field preparation activities.";
                }
            }

            // Get weather button click event
            getWeatherBtn.addEventListener('click', function() {
                const state = stateSelect.value;
                const district = districtSelect.value;
                const village = villageSelect.value;
                
                if (!state) {
                    alert("Please select your state first!");
                    return;
                }
                
                if (!district) {
                    alert("Please select your district!");
                    return;
                }
                
                if (!village) {
                    alert("Please select your village!");
                    return;
                }
                
                // Show loading effect
                getWeatherBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading Forecast...';
                getWeatherBtn.disabled = true;
                
                // Simulate API call delay
                setTimeout(() => {
                    // Update location info
                    const stateName = locations[state].name;
                    const districtName = locations[state].districts[district].name;
                    locationInfo.textContent = `${villageSelect.options[villageSelect.selectedIndex].text}, ${districtName}, ${stateName}`;
                    
                    // Generate forecast cards
                    generateForecastCards();
                    
                    // Update advisory
                    updateAdvisory();
                    
                    // Show forecast section
                    forecastSection.style.display = 'block';
                    
                    // Reset button
                    getWeatherBtn.innerHTML = 'Get Weather Forecast';
                    getWeatherBtn.disabled = false;
                    
                    // Scroll to forecast section
                    forecastSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                }, 1500);
            });
            
            // Initialize with Maharashtra districts
            const maharashtraDistricts = locations.maharashtra.districts;
            for (const key in maharashtraDistricts) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = maharashtraDistricts[key].name;
                districtSelect.appendChild(option);
            }
        });