
        // Mobile Navigation Toggle
        const mobileToggle = document.querySelector('.mobile-toggle');
        const navLinks = document.querySelector('.nav-links');
        if (mobileToggle && navLinks) {
            mobileToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }

        // Link Block Animation on Scroll
        const linkBlocks = document.querySelectorAll('.link-block');
        const animateBlocksOnScroll = () => {
            linkBlocks.forEach((block, index) => {
                const blockPosition = block.getBoundingClientRect().top;
                const screenPosition = window.innerHeight / 1.3;
                if (blockPosition < screenPosition) {
                    setTimeout(() => {
                        block.classList.add('visible');
                    }, 100 * index);
                }
            });
        };
        window.addEventListener('scroll', animateBlocksOnScroll);
        animateBlocksOnScroll();

        // Auth Modal Functions
        function openLogin() {
            // Instead of opening login modal, redirect to user.html
            redirectToUserPage();
        }

        

      

        function closeAuth() {
            const signupForm = document.getElementById('signup-form');
            const signupContainer = document.getElementById('signup-container');
            if (signupForm) signupForm.classList.remove('active');
            setTimeout(() => {
                if (signupContainer) signupContainer.style.display = 'none';
            }, 300);
        }

        function switchToLogin() {
            // Instead of switching to login modal, redirect to user.html
            redirectToUserPage();
        }

        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('signup-container')) {
                closeAuth();
            }
        });

        // Navigation helpers
        function navigateToWeather() {
            window.location.href = "weather.html";
        }
        function navigateToNews() {
            window.location.href = "news.html";
        }

        // Safe attachment of event listeners
        document.addEventListener('DOMContentLoaded', () => {
            const weatherNav = document.getElementById('nav-weather');
            const newsNav = document.getElementById('nav-news');
            const headerLoginBtn = document.getElementById('header-login-btn');
            const quickLoginBtn = document.getElementById('quick-login-btn');

            if (weatherNav) {
                weatherNav.addEventListener('click', (e) => {
                    e.preventDefault();
                    navigateToWeather();
                });
            }
            if (newsNav) {
                newsNav.addEventListener('click', (e) => {
                    e.preventDefault();
                    navigateToNews();
                });
            }
            
            // Login redirection
            if (headerLoginBtn) {
                headerLoginBtn.addEventListener('click', redirectToUserPage);
            }
            if (quickLoginBtn) {
                quickLoginBtn.addEventListener('click', redirectToUserPage);
            }
            

            // Mock Weather Widget
            const mockWeatherData = {
                list: [
                    { dt_txt: "2025-08-03 12:00:00", main: { temp: 28 }, weather: [{ icon: "01d", description: "Clear sky" }] },
                    { dt_txt: "2025-08-04 12:00:00", main: { temp: 26 }, weather: [{ icon: "02d", description: "Few clouds" }] },
                    { dt_txt: "2025-08-05 12:00:00", main: { temp: 24 }, weather: [{ icon: "10d", description: "Rain" }] },
                    { dt_txt: "2025-08-06 12:00:00", main: { temp: 27 }, weather: [{ icon: "03d", description: "Scattered clouds" }] },
                    { dt_txt: "2025-08-07 12:00:00", main: { temp: 29 }, weather: [{ icon: "01d", description: "Clear sky" }] },
                    { dt_txt: "2025-08-08 12:00:00", main: { temp: 30 }, weather: [{ icon: "01d", description: "Clear sky" }] },
                    { dt_txt: "2025-08-09 12:00:00", main: { temp: 31 }, weather: [{ icon: "50d", description: "Mist" }] }
                ]
            };

            const weatherCards = document.getElementById('weather-cards');
            if (weatherCards) {
                weatherCards.innerHTML = '';
                mockWeatherData.list.forEach((day) => {
                    const date = day.dt_txt.split(' ')[0];
                    const temp = day.main.temp;
                    const icon = day.weather[0].icon;
                    const desc = day.weather[0].description;

                    const card = document.createElement('div');
                    card.className = 'weather-card';
                    card.style = "background:white; padding:10px; border-radius:10px; text-align:center; min-width:100px;";
                    card.innerHTML = `
                        <h4 style="margin:5px 0;">${date}</h4>
                        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" style="width:60px;height:60px;">
                        <p style="margin:5px 0; font-size:0.9rem;">${desc}</p>
                        <p style="margin:5px 0; font-weight:600;">${temp}°C</p>
                    `;
                    weatherCards.appendChild(card);
                });
            }
        });
        
        // Redirect to user page with notification
        function redirectToUserPage() {
            const notification = document.getElementById('login-notification');
            if (notification) {
                notification.style.display = 'block';
                setTimeout(() => {
                    window.location.href = 'user.html';
                }, 1500);
            } else {
                window.location.href = 'user.html';
            }
        }
     function checkForSignupParam() {
    console.log("Checking URL parameters...");
    const urlParams = new URLSearchParams(window.location.search);
    const showSignup = urlParams.get('show');
    
    if (showSignup === 'signup') {
        console.log("Opening signup form...");
        openSignup();
    }
}
const servicesLink = document.getElementById('services-link');
const servicesDropdown = document.getElementById('services-dropdown');

servicesLink.addEventListener('click', function(e){
    e.preventDefault();
    servicesDropdown.classList.toggle('show');
});

// Close dropdown if clicked outside
document.addEventListener('click', function(e){
    if(!servicesLink.contains(e.target) && !servicesDropdown.contains(e.target)){
        servicesDropdown.classList.remove('show');
    }
});

// Call this when page loads
document.addEventListener('DOMContentLoaded', checkForSignupParam);


function openSignup() {
    console.log("Attempting to open signup form...");
    const container = document.getElementById('signup-container');
    const form = document.getElementById('signup-form');
    
    if (container && form) {
        console.log("Signup elements found!");
        container.style.display = 'flex';
        setTimeout(() => form.classList.add('active'), 10);
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        console.error("ERROR: Could not find #signup-container or #signup-form");
    }
}

  document.getElementById("services-block").addEventListener("click", function () {
    const block = document.getElementById("services-block");
    const text = document.getElementById("service-text");

    // Replace text only once
    if (!block.classList.contains("expanded")) {
      block.classList.add("expanded");
      text.outerHTML = `
        <ul class="services-list">
          <li><a href='crop pre.html'>🌾 Crop Prediction</a></li>
          <li><a href='ferti.html'>🌱 Fertilizer Recommendation</a></li>
          <li><a href='weather.html'>☔ Rainfall & Yield Prediction</a></li>
        </ul>
      `;
    }
  });

