const searchInput = document.querySelector("#searchForm input");
const searchButton = document.querySelector("#searchForm");
const weatherIcon = document.querySelector("#weather-icon");
const cityName = document.querySelector("#city-name");
const temperature = document.querySelector("#temperature");
const weatherDescription = document.querySelector("#weather-description");
const humidity = document.querySelector("#humidity");
const windSpeed = document.querySelector("#wind-speed");
const uvIndex = document.querySelector("#uv-index");

searchButton.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = searchInput.value.trim();
  //   const country = "NG"; // Default country code for Nigeria
  if (city) {
    fetchWeather(city);
  }
});

const apikey = "Your_API_Key_Here"; // Replace with your actual API key

async function fetchWeather(city, country) {
  const cityResponse =
    await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&country=${country}&language=en&format=json
`);
  const cityData = await cityResponse.json();

  if (!cityData.results || cityData.results.length === 0) {
    alert("City not found. Please try again.");
    return;
  }
  const cityName = cityData.results[0].name;
  const countryName = cityData.results[0].countryname;
  const longitude = cityData.results[0].longitude;
  const latitude = cityData.results[0].latitude;

  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`,
  );
  const weatherData = await weatherResponse.json();

  // Update the UI with the fetched weather data

  updateWeatherUI(weatherData);
}
function updateWeatherUI(weatherData) {
  const currentWeather = weatherData.current;
  const dailyWeather = weatherData.daily;
  cityName.textContent = `${weatherData.cityName}, ${weatherData.country}`;
  temperature.textContent = `${currentWeather.temperature_2m}°C`;
  weatherDescription.textContent = `${getWeatherDescription(currentWeather.weather_code)} · Feels like ${currentWeather.temperature_2m}°C`;
  humidity.textContent = `${currentWeather.relative_humidity_2m}%`;
  windSpeed.textContent = `${currentWeather.wind_speed_10m} km/h`;
  weatherIcon.textContent = getWeatherIcon(currentWeather.weather_code);
}
function getWeatherDescription(code) {
  // Implementation for getting weather description based on code
  switch (code) {
    case 0:
      return "Clear sky";
    case (1, 2, 3):
      return "partly cloudy";
    case (45, 48):
      return "Foggy";
    case (51, 53, 55):
      return "Drizzle";
    case (61, 63, 65):
      return "Rainy";
    case (71, 73, 75):
      return "Snowy";
    case (80, 81, 82):
      return "Rain showers";
    case 95:
      return "Thunderstorm";
    default:
      return "Unknown";
  }
}

function getWeatherIcon(code) {
  // Implementation for getting weather icon based on code
  switch (code) {
    case 0:
      return "☀️";
    case (1, 2, 3):
      return "🌤️";
    case (45, 48):
      return "⛅";
    case (51, 53, 55):
      return "🌦️";
    case (61, 63, 65):
      return "🌧️";
    case (71, 73, 75):
      return "❄️";
    case (80, 81, 82):
      return "⛈️";
    case 95:
      return "🌩️";
    default:
      return "❓";
  }
  updateWeatherUI(weatherData);
}
