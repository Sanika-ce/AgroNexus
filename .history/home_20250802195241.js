
        // Mobile Navigation Toggle
        const mobileToggle = document.querySelector('.mobile-toggle');
        const navLinks = document.querySelector('.nav-links');

        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Link Block Animation on Scroll
        const linkBlocks = document.querySelectorAll('.link-block');

        const animateBlocksOnScroll = () => {
            linkBlocks.forEach((block, index) => {
                const blockPosition = block.getBoundingClientRect().top;
                const screenPosition = window.innerHeight / 1.3;
                
                if(blockPosition < screenPosition) {
                    setTimeout(() => {
                        block.classList.add('visible');
                    }, 100 * index);
                }
            });
        };

        window.addEventListener('scroll', animateBlocksOnScroll);
        // Initial check in case blocks are already in view
        animateBlocksOnScroll();

        // Auth Modal Functions
        function openLogin() {
            document.getElementById('login-container').style.display = 'flex';
            setTimeout(() => {
                document.getElementById('login-form').classList.add('active');
            }, 10);
        }

        function openSignup() {
            document.getElementById('signup-container').style.display = 'flex';
            setTimeout(() => {
                document.getElementById('signup-form').classList.add('active');
            }, 10);
        }

        function closeAuth() {
            document.getElementById('login-form').classList.remove('active');
            document.getElementById('signup-form').classList.remove('active');
            setTimeout(() => {
                document.getElementById('login-container').style.display = 'none';
                document.getElementById('signup-container').style.display = 'none';
            }, 300);
        }

        function switchToSignup() {
            document.getElementById('login-form').classList.remove('active');
            setTimeout(() => {
                document.getElementById('login-container').style.display = 'none';
                openSignup();
            }, 300);
        }

        function switchToLogin() {
            document.getElementById('signup-form').classList.remove('active');
            setTimeout(() => {
                document.getElementById('signup-container').style.display = 'none';
                openLogin();
            }, 300);
        }

        // Close modals if clicked outside
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('login-container')) {
                closeAuth();
            }
            if (e.target === document.getElementById('signup-container')) {
                closeAuth();
            }
        });

        // Weather and News Navigation Functions
        function navigateToWeather() {
            // In a real application, this would redirect to weather.html
            // For this demo, we'll simulate the navigation
            alert("Navigating to weather.html page...");
            window.location.href = "weather.html";
        }

        function navigateToNews() {
            // In a real application, this would redirect to news.html
            // For this demo, we'll simulate the navigation
            alert("Navigating to news.html page...");
            window.location.href = "news.html";
        }

        // Set up event listeners for navigation
        document.getElementById('nav-weather').addEventListener('click', function(e) {
            e.preventDefault();
            navigateToWeather();
        });

        document.getElementById('nav-news').addEventListener('click', function(e) {
            e.preventDefault();
            navigateToNews();
        });

        document.getElementById('weather-link-block').addEventListener('click', navigateToWeather);
        document.getElementById('weather-container').addEventListener('click', navigateToWeather);
        
        document.getElementById('news-link-block').addEventListener('click', navigateToNews);

        // Weather Widget
        document.addEventListener("DOMContentLoaded", () => {
            // Mock weather data since we can't use a real API key
            const mockWeatherData = {
                list: [
                    { 
                        dt_txt: "2023-08-03 12:00:00",
                        main: { temp: 28 },
                        weather: [{ icon: "01d", description: "Clear sky" }]
                    },
                    { 
                        dt_txt: "2023-08-04 12:00:00",
                        main: { temp: 26 },
                        weather: [{ icon: "02d", description: "Few clouds" }]
                    },
                    { 
                        dt_txt: "2023-08-05 12:00:00",
                        main: { temp: 24 },
                        weather: [{ icon: "10d", description: "Rain" }]
                    },
                    { 
                        dt_txt: "2023-08-06 12:00:00",
                        main: { temp: 27 },
                        weather: [{ icon: "03d", description: "Scattered clouds" }]
                    },
                    { 
                        dt_txt: "2023-08-07 12:00:00",
                        main: { temp: 29 },
                        weather: [{ icon: "01d", description: "Clear sky" }]
                    },
                    { 
                        dt_txt: "2023-08-08 12:00:00",
                        main: { temp: 30 },
                        weather: [{ icon: "01d", description: "Clear sky" }]
                    },
                    { 
                        dt_txt: "2023-08-09 12:00:00",
                        main: { temp: 31 },
                        weather: [{ icon: "50d", description: "Mist" }]
                    }
                ]
            };

            const weatherCards = document.getElementById('weather-cards');
            weatherCards.innerHTML = '';
            
            mockWeatherData.list.forEach((day, index) => {
                const date = day.dt_txt.split(' ')[0];
                const temp = day.main.temp;
                const icon = day.weather[0].icon;
                const desc = day.weather[0].description;
                
                weatherCards.innerHTML += `
                    <div class="weather-card">
                        <h4>${date}</h4>
                        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
                        <p>${desc}</p>
                        <p>${temp}°C</p>
                    </div>
                `;
            });
        });
    