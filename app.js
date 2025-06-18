const API_KEY = "f8dc82ee22b1ccfea24de675f66e5b7a";

// Fetch Weather Function
async function getWeather() {
    const city = document.getElementById('city').value.trim();
    if (city === "") {
        alert("Please enter a city name.");
        return;
    }

    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        // Fetch current weather
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
        document.getElementById("weather-info").textContent =
            currentData.weather[0].description;

        // Fetch forecast
        const forecastRes = await fetch(forecastUrl);
        const forecastData = await forecastRes.json();

        // Hourly Forecast (next 6 entries)
        const hourlyContainer = document.getElementById("hourly-forecast");
        hourlyContainer.innerHTML = "";
        for (let i = 0; i < 6; i++) {
            const item = forecastData.list[i];
            const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            hourlyContainer.innerHTML += `
                <div class="bg-white p-4 rounded-xl shadow-md text-center">
                    <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" class="w-10 h-10 mx-auto">
                    <div class="text-sm text-gray-700">${time}</div>
                    <div class="text-md text-gray-800 font-semibold">${item.main.temp}°C</div>
                    <div class="text-xs text-gray-500">${item.weather[0].description}</div>
                </div>
            `;
        }

        // 5-Day Forecast (pick one from each day at 12PM)
        const fiveDayContainer = document.getElementById("five-day-forecast");
        fiveDayContainer.innerHTML = "";

        const dailyMap = {};

        for (let item of forecastData.list) {
            const date = new Date(item.dt_txt);
            if (date.getHours() === 12 && !dailyMap[date.toDateString()]) {
                dailyMap[date.toDateString()] = item;
            }
        }

        Object.values(dailyMap).slice(0, 5).forEach((item) => {
            const date = new Date(item.dt_txt).toLocaleDateString();
            fiveDayContainer.innerHTML += `
                <div class="bg-gradient-to-r from-green-100 via-blue-100 to-purple-200 p-6 rounded-lg shadow-lg text-center">
                    <div class="text-lg font-bold text-gray-800">${date}</div>
                    <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" class="w-12 h-12 mx-auto">
                    <div class="text-gray-800 text-md">${item.main.temp_min}°C / ${item.main.temp_max}°C</div>
                    <div class="text-gray-500 text-sm">${item.weather[0].description}</div>
                </div>
            `;
        });

    } catch (err) {
        alert("Something went wrong. Please try again later.");
        console.error(err);
    }
}

// Handle Enter Key
document.getElementById("city").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        getWeather();
    }
});
