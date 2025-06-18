const apiKey = 'my api key'; 

// ==============Function to get weather data=============
async function getWeather() {
    const city = document.getElementById('city').value;
    
    if (city === "") {
        alert("Please enter a city name.");
        return;
    }
    
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},USA&appid=${apiKey}&units=metric`;



    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        //======== fetch current weather data=================
        const currentWeatherResponse = await fetch(currentWeatherUrl);
        const currentWeatherData = await currentWeatherResponse.json();

        if (currentWeatherData.cod !== 200) {
            alert("City not found! Please check the name.");
            return;
        }

        // ============== current weather data====================
        const weatherIcon = document.getElementById('weather-icon');
        const tempDiv = document.getElementById('temp-div');
        const weatherInfo = document.getElementById('weather-info');

        const temp = currentWeatherData.main.temp;
        const description = currentWeatherData.weather[0].description;
        const iconCode = currentWeatherData.weather[0].icon;

        weatherIcon.src = `http://openweathermap.org/img/wn/${iconCode}.png`;
        weatherIcon.classList.remove("hidden");
        tempDiv.textContent = `${temp}°C`;
        weatherInfo.textContent = description.charAt(0).toUpperCase() + description.slice(1);

        // fetch hourly and 5-day forecast data==============
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
        
        //=============hourly forecast============
        const hourlyForecastContainer = document.getElementById('hourly-forecast');
        hourlyForecastContainer.innerHTML = "";
        for (let i = 0; i < 6; i++) {
            const forecast = forecastData.list[i];
            const time = new Date(forecast.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
            const temp = forecast.main.temp;
            const iconCode = forecast.weather[0].icon;
            const description = forecast.weather[0].description;

            hourlyForecastContainer.innerHTML += `
                <div class="bg-white p-4 rounded-xl shadow-md flex flex-col items-center space-y-2">
                    <img src="http://openweathermap.org/img/wn/${iconCode}.png" alt="Weather icon" class="w-12 h-12">
                    <div class="text-gray-700 font-semibold">${time}</div>
                    <div class="text-gray-600">${temp}°C</div>
                    <div class="text-gray-500 text-xs">${description}</div>
                </div>
            `;
        }

        //==============5-day forecast=================
        const fiveDayForecastContainer = document.getElementById('five-day-forecast');
        fiveDayForecastContainer.innerHTML = "";
        for (let i = 0; i < 5; i++) {
            const forecast = forecastData.list[i * 8]; // Get data for each day at 12:00
            const date = new Date(forecast.dt * 1000).toLocaleDateString();
            const tempMin = forecast.main.temp_min;
            const tempMax = forecast.main.temp_max;
            const iconCode = forecast.weather[0].icon;
            const description = forecast.weather[0].description;

            fiveDayForecastContainer.innerHTML += `
                <div class="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-200 p-6 rounded-xl shadow-lg text-center space-y-3">
                    <div class="text-lg font-semibold text-gray-800">${date}</div>
                    <img src="http://openweathermap.org/img/wn/${iconCode}.png" alt="Weather icon" class="w-14 h-14 mx-auto">
                    <div class="text-gray-700 text-lg">${tempMin}°C / ${tempMax}°C</div>
                    <div class="text-gray-500 text-sm">${description.charAt(0).toUpperCase() + description.slice(1)}</div>
                </div>
            `;
        }

    } catch (error) {
        alert("Error fetching weather data. Please try again later.");
    }
}

//================for handling the form submission================
document.getElementById("city").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        getWeather();
    }
});