const API_KEY = process.env.WEATHER_API_KEY;

async function getWeather(cityName) {
    const city = cityName || document.getElementById('city').value.trim();
    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    updateRecentCities(city);

    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const currentRes = await fetch(currentUrl);
        const currentData = await currentRes.json();
        if (currentData.cod !== 200) {
            alert("City not found! Please check the name.");
            return;
        }

        const iconCode = currentData.weather[0].icon;
        document.getElementById("weather-icon").src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
        document.getElementById("weather-icon").classList.remove("hidden");
        document.getElementById("temp-div").textContent = `${currentData.main.temp}°C`;
        document.getElementById("weather-info").textContent = currentData.weather[0].description;

        // Hourly Forecast
        const forecastRes = await fetch(forecastUrl);
        const forecastData = await forecastRes.json();

        const hourlyContainer = document.getElementById("hourly-forecast");
        hourlyContainer.innerHTML = "";
        for (let i = 0; i < 6; i++) {
            const item = forecastData.list[i];
            const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            hourlyContainer.innerHTML += `
                <div class="bg-white p-4 rounded-xl shadow-md text-center hover:shadow-xl transition">
                    <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" class="w-10 h-10 mx-auto" />
                    <div class="text-sm text-gray-700">${time}</div>
                    <div class="text-md text-gray-800 font-semibold">${item.main.temp}°C</div>
                    <div class="text-xs text-gray-500">${item.weather[0].description}</div>
                </div>
            `;
        }

        // 5-Day Forecast
        const dailyMap = {};
        forecastData.list.forEach(item => {
            const date = new Date(item.dt_txt);
            if (date.getHours() === 12 && !dailyMap[date.toDateString()]) {
                dailyMap[date.toDateString()] = item;
            }
        });

        const fiveDayContainer = document.getElementById("five-day-forecast");
        fiveDayContainer.innerHTML = "";
        Object.values(dailyMap).slice(0, 5).forEach(item => {
            const date = new Date(item.dt_txt).toLocaleDateString();

            fiveDayContainer.innerHTML += `
                <div class="bg-gradient-to-r from-green-100 via-blue-100 to-purple-200 p-6 rounded-lg shadow-lg text-center hover:shadow-2xl transition">
                    <div class="text-lg font-bold text-gray-800">${date}</div>
                    <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" class="w-12 h-12 mx-auto" />
                    <div class="text-gray-800 text-md font-semibold">${item.main.temp_min}°C / ${item.main.temp_max}°C</div>
                    <div class="text-gray-500 text-sm">${item.weather[0].description}</div>
                    <div class="text-gray-500 text-sm">💧 Humidity: ${item.main.humidity}%</div>
                    <div class="text-gray-500 text-sm">🌬️ Wind: ${item.wind.speed} m/s</div>
                </div>
            `;
        });

    } catch (err) {
        alert("Something went wrong. Please try again later.");
        console.error(err);
    }
}

// Get Current Location Forecast
function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const reverseUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

        const res = await fetch(reverseUrl);
        const data = await res.json();
        if (data.name) {
            getWeather(data.name);
        }
    }, () => {
        alert("Unable to retrieve your location.");
    });
}

// Event Listeners
document.getElementById("city").addEventListener("keypress", (e) => {
    if (e.key === "Enter") getWeather();
});

// Recently searched dropdown using localStorage
function updateRecentCities(city) {
    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
    if (!cities.includes(city)) {
        cities.unshift(city);
        if (cities.length > 5) cities.pop();
        localStorage.setItem("recentCities", JSON.stringify(cities));
    }
    loadRecentCities();
}

function loadRecentCities() {
    const dropdown = document.getElementById("recent-dropdown");
    const cities = JSON.parse(localStorage.getItem("recentCities")) || [];

    if (cities.length === 0) {
        dropdown.classList.add("hidden");
        return;
    }

    dropdown.classList.remove("hidden");
    dropdown.innerHTML = `<option disabled selected>Recent Cities</option>`;
    cities.forEach(city => {
        dropdown.innerHTML += `<option value="${city}">${city}</option>`;
    });
}

function handleRecentCity(select) {
    const city = select.value;
    if (city) getWeather(city);
}

// Load recent cities on start
loadRecentCities();
