const searchInput = document.querySelector("#searchForm input");
const searchForm = document.querySelector("#searchForm");
const weatherCard = document.querySelector("#weather-card");
const weatherIcon = document.querySelector("#weather-icon");
const cityName = document.querySelector("#city-name");
const temperature = document.querySelector("#temperature");
const weatherDescription = document.querySelector("#weather-description");
const weatherStats = document.querySelector("#stats");
const loadWeather = document.querySelector(".loader");
const weatherError = document.querySelector(".error");
const humidity = document.querySelector("#humidity");
const windSpeed = document.querySelector("#wind-speed");
const uvIndex = document.querySelector("#uv-index");
const forecastTitle = document.querySelector(".forecast-title");
const forecastContent = document.querySelector(".forecast");

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

async function showPosition(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

  weatherError.style.display = "none";
  // showloader
  loadWeather.style.display = "block";
  try {
    const cityData = await getCity(latitude, longitude);
    const weatherData = await getWeather(longitude, latitude);

    updateWeatherUI({ ...weatherData });
  } catch (error) {
    addErrorToUI();
  }
}

function showError(error) {
  console.log("Error occurred: " + error.message);
}

getLocation();

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = searchInput.value.trim();
  //   const country = "NG"; // Default country code for Nigeria
  if (city) {
    weatherError.style.display = "none";
    // showloader
    loadWeather.style.display = "block";
    fetchWeather(city);
  }
});

const apikey = "Your_API_Key_Here"; // Replace with your actual API key

async function fetchWeather(city) {
  try {
    const { latitude, longitude, cityName, country } = await getPosition(city);
    const weatherData = await getWeather(longitude, latitude);
    updateWeatherUI({ ...weatherData, cityName, country });
  } catch (error) {
    addErrorToUI(error);
  }
}

function addErrorToUI(error) {
  loadWeather.style.display = "none";
  weatherError.style.display = "block";
  console.error(error);
}

// Get City - city
async function getPosition(city) {
  const positionResponse =
    await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json
  `);
  const positionData = await positionResponse.json();

  if (!positionData.results || positionData.results.length === 0) {
    alert("City not found. Please try again.");
    return;
  }
  const cityName = positionData.results[0].name;
  const country = positionData.results[0].country;
  const longitude = positionData.results[0].longitude;
  const latitude = positionData.results[0].latitude;

  return { cityName, country, longitude, latitude };
}

async function getCity(lat, lon) {
  const cityResponse = await fetch(
    `https://bigdatacloud.net?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
  );
  const cityData = await cityResponse.json();

  console.log(cityData);
}

// Get Weather -> long, lat
async function getWeather(longitude, latitude) {
  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`,
  );
  const weatherData = await weatherResponse.json();

  return weatherData;
}

function updateWeatherUI(weatherData) {
  // hide loader
  loadWeather.style.display = "none";
  console.log(weatherData);
  const currentWeather = weatherData.current;
  const dailyWeather = weatherData.daily;
  cityName.textContent = `${weatherData.cityName}, ${weatherData.country}`;
  temperature.textContent = `${currentWeather.temperature_2m}`;
  weatherDescription.textContent = `${getWeatherDescription(currentWeather.weather_code)} · Feels like ${currentWeather.temperature_2m}°C`;
  humidity.textContent = `${currentWeather.relative_humidity_2m}%`;
  windSpeed.textContent = `${currentWeather.wind_speed_10m} km/h`;
  weatherIcon.textContent = getWeatherIcon(currentWeather.weather_code);

  const forecast = buildForecast(dailyWeather);
  updateDailyWeatherForecastUI(forecast);
}

function updateDailyWeatherForecastUI(dailyForecast) {
  if (!dailyForecast) return;

  console.log(dailyForecast);

  weatherCard.style.display = "block";
  weatherStats.style.display = "flex";
  forecastTitle.style.display = "block";
  forecastContent.innerHTML = "";

  dailyForecast.slice(0, 5).forEach((dayForecast) => {
    forecastContent.innerHTML += `
     <div class="forecast-item">
      <span>${dayForecast.day}</span>
      <span>${getWeatherIcon(dayForecast.weather_code)}</span>
      <span>
        <strong>${dayForecast.max}°</strong><br />
        ${dayForecast.min}
      </span>
    </div>
    `;
  });
}

function buildForecast(dailyWeather) {
  const forecast = [];
  for (let i = 0; i < 7; i++) {
    const object = {
      day: isToday(dailyWeather.time[i])
        ? "Today"
        : getDay(dailyWeather.time[i]),
      min: dailyWeather.temperature_2m_min[i],
      max: dailyWeather.temperature_2m_max[i],
      weather_code: dailyWeather.weather_code[i],
    };
    forecast.push(object);
  }
  return forecast;
}

function isToday(date) {
  // get current Date
  const now = new Date();
  // create a date object from `date`
  const inputDate = new Date(date);
  const today = now.getDate() === inputDate.getDate();
  return today;
}

function getDay(date) {
  // Create date array [Sunday, "moda"]
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // create a date object from `date`
  const inputDate = new Date(date);
  // get date
  const day = inputDate.getDay();
  // return
  return dayNames[day];
}

function getWeatherDescription(code) {
  // Implementation for getting weather description based on code
  switch (code) {
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
      return "Clear sky";
  }
}

function getWeatherIcon(code) {
  // Implementation for getting weather icon based on code
  switch (code) {
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
      return "☀️";
  }
  updateWeatherUI(weatherData);
}
