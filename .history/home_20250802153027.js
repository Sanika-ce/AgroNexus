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








        //wheather

        document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "YOUR_API_KEY";

  // Get user location from browser
  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

      fetch(url)
        .then(response => response.json())
        .then(data => {
          const weatherContainer = document.getElementById("weather-container");
          weatherContainer.innerHTML = "<h2>7-Day Forecast for Your Location</h2>";

          const dailyData = {};

          data.list.forEach(entry => {
            const date = entry.dt_txt.split(" ")[0];
            if (!dailyData[date]) {
              dailyData[date] = entry;
            }
          });

          const days = Object.keys(dailyData).slice(0, 7);
          days.forEach(date => {
            const weather = dailyData[date];
            const temp = weather.main.temp;
            const icon = weather.weather[0].icon;
            const desc = weather.weather[0].description;

            weatherContainer.innerHTML += `
              <div class="weather-card">
                <h4>${date}</h4>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
                <p>${desc}</p>
                <p>${temp}°C</p>
              </div>
            `;
          });
        })
        .catch(err => {
          console.error("Error fetching weather:", err);
        });
    },
    error => {
      alert("Location access denied. Cannot fetch weather.");
    }
  );
});
