
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
    const container = document.getElementById('login-container');
    const form = document.getElementById('login-form');
    if (container && form) {
      container.style.display = 'flex';
      setTimeout(() => form.classList.add('active'), 10);
    }
  }

  function openSignup() {
    const container = document.getElementById('signup-container');
    const form = document.getElementById('signup-form');
    if (container && form) {
      container.style.display = 'flex';
      setTimeout(() => form.classList.add('active'), 10);
    }
  }

  function closeAuth() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginContainer = document.getElementById('login-container');
    const signupContainer = document.getElementById('signup-container');
    if (loginForm) loginForm.classList.remove('active');
    if (signupForm) signupForm.classList.remove('active');
    setTimeout(() => {
      if (loginContainer) loginContainer.style.display = 'none';
      if (signupContainer) signupContainer.style.display = 'none';
    }, 300);
  }

  function switchToSignup() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.classList.remove('active');
      setTimeout(() => {
        document.getElementById('login-container').style.display = 'none';
        openSignup();
      }, 300);
    }
  }

  function switchToLogin() {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.classList.remove('active');
      setTimeout(() => {
        document.getElementById('signup-container').style.display = 'none';
        openLogin();
      }, 300);
    }
  }










  window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('login-container') ||
        e.target === document.getElementById('signup-container')) {
      closeAuth();
    }
  });







     document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("login-btn");

    if (loginBtn) {
        loginBtn.addEventListener("click", function () {
            // Optional: You can validate fields here before redirecting
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            if (email.trim() !== "" && password.trim() !== "") {
                // Redirect to user.html
                window.location.href = "user.html";
            } else {
                alert("Please enter both email and password.");
            }
        });
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
    const weatherBlock = document.getElementById('weather-link-block');
    const newsBlock = document.getElementById('news-link-block');

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
    if (weatherBlock) {
      weatherBlock.addEventListener('click', navigateToWeather);
    }
    if (newsBlock) {
      newsBlock.addEventListener('click', navigateToNews);
    }

    // Mock Weather Widget (replace later with real API)
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

