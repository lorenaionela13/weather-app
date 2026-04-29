let history = JSON.parse(localStorage.getItem("favorites")) || [];
let currentCity = "";

async function getWeather(cityInput) {
    const city = cityInput || document.getElementById("city").value;
    currentCity = city;

    const resultEl = document.getElementById("result");
    const loadingEl = document.getElementById("loading");

    try {
        loadingEl.innerText = "⏳ Loading...";

        // 1. Geocoding API
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
        );
        const geoData = await geoResponse.json();

        if (!geoData.results) {
            resultEl.innerText = "Orașul nu a fost găsit";
            return;
        }

        const { latitude, longitude } = geoData.results[0];

        // 2. Weather API
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        const weatherData = await weatherResponse.json();

        const temp = weatherData.current_weather.temperature;
        const wind = weatherData.current_weather.windspeed;

        let icon = "🌤";
        if (temp <= 0) icon = "❄️";
        else if (temp < 10) icon = "🌥";
        else if (temp < 20) icon = "⛅";
        else icon = "☀️";

        resultEl.innerText = `${icon} ${city}: ${temp}°C | Vânt: ${wind} km/h`;

    } catch (error) {
        resultEl.innerText = "Eroare la încărcarea datelor";
    } finally {
        loadingEl.innerText = "";
    }
}

/* ⭐ FAVORITE */
function toggleFavorite() {
    if (!currentCity) return;

    if (!history.includes(currentCity)) {
        history.push(currentCity);
    } else {
        history = history.filter(c => c !== currentCity);
    }

    localStorage.setItem("favorites", JSON.stringify(history));
    renderFavorites();
}

function renderFavorites() {
    const list = document.getElementById("history");
    list.innerHTML = "";

    history.forEach(city => {
        const li = document.createElement("li");
        li.innerText = city;
        li.onclick = () => getWeather(city);
        list.appendChild(li);
    });
}

/* 🌙 DARK MODE */
function toggleTheme() {
    document.body.classList.toggle("dark");
}

/* 📍 GEOLOCATION */
function getMyLocation() {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );

        const data = await response.json();
        const temp = data.current_weather.temperature;

        document.getElementById("result").innerText =
            `📍 Locația ta: ${temp}°C`;
    });
}

renderFavorites();