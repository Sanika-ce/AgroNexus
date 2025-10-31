document.addEventListener('DOMContentLoaded', function() {
            // Sample data for locations
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
            const forecastCards = document.getElementById('forecastCards');
            const locationInfo = document.getElementById('selectedLocation');
            const advisorySummary = document.getElementById('advisorySummary');
            const advisoryGrid = document.getElementById('advisoryGrid');

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

            // Weather icons mapping
            const weatherIcons = {
                'sunny': 'fa-sun',
                'partly-cloudy': 'fa-cloud-sun',
                'cloudy': 'fa-cloud',
                'rain': 'fa-cloud-rain',
                'thunderstorm': 'fa-bolt',
                'snow': 'fa-snowflake'
            };

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
                getWeatherBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching Forecast...';
                getWeatherBtn.disabled = true;
                
                // Simulate API call delay
                setTimeout(() => {
                    // Update location info
                    const stateName = locations[state].name;
                    const districtName = locations[state].districts[district].name;
                    const villageName = villageSelect.options[villageSelect.selectedIndex].text;
                    locationInfo.textContent = `${villageName}, ${districtName}, ${stateName}`;
                    
                    // Generate forecast data
                    const forecastData = generateForecastData();
                    
                    // Generate forecast cards
                    generateForecastCards(forecastData);
                    
                    // Generate charts
                    generateCharts(forecastData);
                    
                    // Generate advisory
                    generateAdvisory(forecastData);
                    
                    // Show forecast section
                    forecastSection.style.display = 'block';
                    
                    // Reset button
                    getWeatherBtn.innerHTML = '<i class="fas fa-cloud-sun"></i> Get Weather Forecast';
                    getWeatherBtn.disabled = false;
                    
                    // Scroll to forecast section
                    forecastSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                }, 1500);
            });
            
            // Function to generate forecast data
            function generateForecastData() {
                const forecast = [];
                const conditions = ['sunny', 'partly-cloudy', 'cloudy', 'rain', 'thunderstorm'];
                
                const today = new Date();
                
                for (let i = 0; i < 7; i++) {
                    const date = new Date();
                    date.setDate(today.getDate() + i);
                    
                    const condition = conditions[Math.floor(Math.random() * conditions.length)];
                    const maxTemp = 25 + Math.floor(Math.random() * 15);
                    const minTemp = maxTemp - 5 - Math.floor(Math.random() * 5);
                    const precipitation = condition === 'rain' || condition === 'thunderstorm' ? 
                        Math.floor(Math.random() * 20) + 10 : Math.floor(Math.random() * 10);
                    
                    forecast.push({
                        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
                        condition: condition,
                        icon: weatherIcons[condition],
                        maxTemp: maxTemp,
                        minTemp: minTemp,
                        precipitation: precipitation,
                        humidity: 40 + Math.floor(Math.random() * 40),
                        wind: Math.floor(Math.random() * 20) + 5
                    });
                }
                
                return forecast;
            }
            
            // Function to generate forecast cards
            function generateForecastCards(forecastData) {
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
                            <div class="temperature">${day.maxTemp}°C</div>
                            <div class="weather-condition">${day.condition.replace('-', ' ').toUpperCase()}</div>
                            
                            <div class="weather-details">
                                <div class="detail">
                                    <i class="fas fa-temperature-low"></i>
                                    <div class="label">Min Temp</div>
                                    <div class="value">${day.minTemp}°C</div>
                                </div>
                                <div class="detail">
                                    <i class="fas fa-tint"></i>
                                    <div class="label">Humidity</div>
                                    <div class="value">${day.humidity}%</div>
                                </div>
                                <div class="detail">
                                    <i class="fas fa-wind"></i>
                                    <div class="label">Wind</div>
                                    <div class="value">${day.wind} km/h</div>
                                </div>
                                <div class="detail">
                                    <i class="fas fa-cloud-rain"></i>
                                    <div class="label">Rain</div>
                                    <div class="value">${day.precipitation}%</div>
                                </div>
                            </div>
                        </div>
                    `;
                    forecastCards.appendChild(card);
                });
            }
            
            // Function to generate charts
            function generateCharts(forecastData) {
                const dates = forecastData.map(day => day.date);
                const maxTemps = forecastData.map(day => day.maxTemp);
                const minTemps = forecastData.map(day => day.minTemp);
                const precipitation = forecastData.map(day => day.precipitation);
                
                // Temperature Chart
                const tempCtx = document.getElementById('temperatureChart').getContext('2d');
                new Chart(tempCtx, {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [
                            {
                                label: 'Max Temperature (°C)',
                                data: maxTemps,
                                borderColor: '#f44336',
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                borderWidth: 2,
                                fill: false,
                                tension: 0.3
                            },
                            {
                                label: 'Min Temperature (°C)',
                                data: minTemps,
                                borderColor: '#2196f3',
                                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                borderWidth: 2,
                                fill: false,
                                tension: 0.3
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: '7-Day Temperature Forecast'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: false,
                                title: {
                                    display: true,
                                    text: 'Temperature (°C)'
                                }
                            }
                        }
                    }
                });
                
                // Precipitation Chart
                const precipCtx = document.getElementById('precipitationChart').getContext('2d');
                new Chart(precipCtx, {
                    type: 'bar',
                    data: {
                        labels: dates,
                        datasets: [{
                            label: 'Precipitation (%)',
                            data: precipitation,
                            backgroundColor: 'rgba(33, 150, 243, 0.7)',
                            borderColor: 'rgba(33, 150, 243, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: '7-Day Precipitation Forecast'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                title: {
                                    display: true,
                                    text: 'Precipitation Probability (%)'
                                }
                            }
                        }
                    }
                });
            }
            
            // Function to generate agricultural advisory
            function generateAdvisory(forecastData) {
                // Calculate average conditions
                const avgTemp = forecastData.reduce((sum, day) => sum + (day.maxTemp + day.minTemp)/2, 0) / forecastData.length;
                const totalPrecip = forecastData.reduce((sum, day) => sum + day.precipitation, 0);
                
                // Advisory summary
                let summary = '';
                if (totalPrecip > 70) {
                    summary = "Heavy rainfall expected this week. Focus on drainage and protection measures.";
                } else if (totalPrecip > 40) {
                    summary = "Moderate rainfall expected. Good time for planting and irrigation management.";
                } else if (avgTemp > 30) {
                    summary = "Hot and dry conditions. Increase irrigation and protect crops from heat stress.";
                } else {
                    summary = "Stable weather conditions. Good for most farming activities and crop maintenance.";
                }
                
                advisorySummary.textContent = summary;
                
                // Advisory cards
                const advisories = [
                    {
                        icon: 'fa-tint',
                        title: 'Irrigation',
                        content: totalPrecip > 50 ? "Reduce irrigation as sufficient rainfall is expected" : 
                            "Increase irrigation frequency to maintain soil moisture"
                    },
                    {
                        icon: 'fa-spray-can',
                        title: 'Pest Control',
                        content: forecastData.some(d => d.humidity > 70) ? 
                            "Monitor for fungal diseases and apply preventive sprays" : 
                            "Standard pest control measures recommended"
                    },
                    {
                        icon: 'fa-seedling',
                        title: 'Planting',
                        content: totalPrecip > 40 ? "Favorable conditions for planting new crops" : 
                            "Delay planting until rainfall improves or irrigate thoroughly"
                    },
                    {
                        icon: 'fa-wind',
                        title: 'Wind Protection',
                        content: forecastData.some(d => d.wind > 15) ? 
                            "Secure vulnerable crops and structures against strong winds" : 
                            "No special wind protection needed"
                    }
                ];
                
                advisoryGrid.innerHTML = '';
                
                advisories.forEach(advice => {
                    const card = document.createElement('div');
                    card.className = 'advisory-card';
                    card.innerHTML = `
                        <h4><i class="fas ${advice.icon}"></i> ${advice.title}</h4>
                        <p>${advice.content}</p>
                    `;
                    advisoryGrid.appendChild(card);
                });
            }
            
            // Initialize with Maharashtra districts
            const maharashtraDistricts = locations.maharashtra.districts;
            for (const key in maharashtraDistricts) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = maharashtraDistricts[key].name;
                districtSelect.appendChild(option);
            }
        });