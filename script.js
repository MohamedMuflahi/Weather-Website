const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const feelsLikeBox = document.querySelector(".feels-like-box");
const pressureBox = document.querySelector(".pressure-box");
const visibilityBox = document.querySelector(".visibility-box");
const windBox = document.querySelector(".wind-box");
const humidityBox = document.querySelector(".humidity-box");

const humidityValue = document.querySelector(".humidity-box .value");
const windValue = document.querySelector(".wind-box .value");

const API_KEY = "API_KEY";

const roundToNearestWhole = (number) => {
  return Math.round(number);
};

const createWeatherCard = (cityName, weatherItem, index) => {
  let weatherIcon;

  switch (weatherItem.weather[0].main) {
    case "Clear":
      weatherIcon = "images/sunny.png";
      break;
    case "Clouds":
      weatherIcon = "images/clouds.png";
      break;
    case "Rain":
      weatherIcon = "images/rain.png";
      break;
    case "Snow":
      weatherIcon = "images/snow.png";
      break;
    case "Drizzle":
      weatherIcon = "images/drizzle.png";
      break;
    case "Wind":
      weatherIcon = "images/wind.png";
      break;
    default:
      weatherIcon = "images/sunny.png";
      break;
  }

  if (index === 0) {
    const localTime = new Date(weatherItem.dt * 1000);
    const timeZoneOffset = localTime.getTimezoneOffset() * 60 * 1000;
    const localTimeWithOffset = new Date(localTime.getTime() - timeZoneOffset);

    return `<div class="details">
                <h2>${cityName} (${localTimeWithOffset.toLocaleDateString('en-US', { weekday: 'long' })})</h2>
                <h2>&#127777 ${Math.round((weatherItem.main.temp - 273.15) * 9 / 5 + 32)}°F</h2>
              </div>
              <div class="icon weather-icon">
                <img src="${weatherIcon}" >
              </div>`;
  } else {
    const localTime = new Date(weatherItem.dt * 1000);
    const timeZoneOffset = localTime.getTimezoneOffset() * 60 * 1000;
    const localTimeWithOffset = new Date(localTime.getTime() - timeZoneOffset);

    return `<li class="card">
                <h3>${localTimeWithOffset.toLocaleDateString('en-US', { weekday: 'long' })}</h3>
                <img src="${weatherIcon}"  class="weather-card-icon">
                <h6>&#127777Temp: ${Math.round((weatherItem.main.temp - 273.15) * 9 / 5 + 32)}°F</h6>
            </li>`;
  }
};

const updateAdditionalInfo = (feelsLike, pressure) => {
  feelsLikeBox.innerHTML = `<h6 class="feels-like">&#127777Feels Like: ${roundToNearestWhole(feelsLike)}°F</h6>`;
  pressureBox.innerHTML = `<h6 class="pressure">🕓Pressure: ${roundToNearestWhole(pressure)} hPa</h6>`;
};

const updateVisibility = (visibility) => {
  const visibilityText = document.querySelector(".visibility");
  const visibilityInMiles = Math.ceil(visibility * 0.000621371); // Round up and convert meters to miles
  visibilityText.innerHTML = `<h6 class="visibility">👁️Visibility: ${visibilityInMiles} mi</h6>`;
  visibilityBox.style.display = "block";
};

const updateSunriseAndSunset = (sunrise, sunset) => {
  const sunriseTime = new Date(sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
  const sunsetTime = new Date(sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });

  document.querySelector('.sunrise h4').textContent = sunriseTime;
  document.querySelector('.sunset h4').textContent = sunsetTime;
};

const updateBackgroundColorAndImage = (weatherCondition) => {
  let colorClass = "";

  switch (weatherCondition) {
    case "Clear":
      colorClass = "clear";
      break;
    case "Clouds":
      colorClass = "cloudy";
      break;
    case "Rain":
      colorClass = "rainy";
      break;
    case "Snow":
      colorClass = "snowy";
      break;
    default:
      colorClass = "clear";
      break;
  }

  document.body.className = colorClass;
};

const snowContainer = document.createElement("div");
snowContainer.classList.add("snow");
for (let i = 0; i < 100; i++) {
  const snowflake = document.createElement("div");
  snowflake.classList.add("snowflake");
  snowflake.innerHTML = '❅';
  snowflake.style.left = `${Math.random() * 100}vw`;
  snowflake.style.animationDelay = `${Math.random()}s`;
  snowContainer.appendChild(snowflake);
}
document.body.appendChild(snowContainer);

const getWeatherDetails = (cityName, latitude, longitude) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch weather data. Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!data.list || data.list.length === 0) {
        alert("No weather forecast data available for the selected location.");
        return;
      }

      const feelsLike = data.list[0].main.feels_like;
      const pressure = data.list[0].main.pressure;
      const visibility = data.list[0].visibility;
      const sunrise = data.city.sunrise;
      const sunset = data.city.sunset;

      updateAdditionalInfo(((feelsLike - 273.15) * 9 / 5 + 32), pressure);
      updateVisibility(visibility);
      updateSunriseAndSunset(sunrise, sunset);

      const weatherCondition = data.list[0].weather[0].main;
      updateBackgroundColorAndImage(weatherCondition);

      const forecastsByDate = {};

      data.list.forEach((forecast) => {
        const forecastDate = forecast.dt_txt.split(' ')[0];

        if (!forecastsByDate[forecastDate]) {
          forecastsByDate[forecastDate] = forecast;
        } else if (forecast.dt_txt.includes('12:00:00')) {
          forecastsByDate[forecastDate] = forecast;
        }
      });

      const fiveDaysForecast = Object.values(forecastsByDate);

      currentWeatherDiv.innerHTML = createWeatherCard(cityName, data.list[0], 0);
      windBox.innerHTML = `<h6>Wind: ${data.list[0].wind.speed} M/S</h6>`;
      humidityBox.innerHTML = `<h6> Humidity: ${data.list[0].main.humidity}% </h6>`;

      weatherCardsDiv.innerHTML = "";
      fiveDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityName, weatherItem, index);
        if (index !== 0) {
          weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        }
      });
    })
    .catch((error) => {
      console.error("Error fetching weather forecast:", error);
      alert("An error occurred while fetching the weather forecast!");
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (cityName === "") return;
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data.length) return alert(`No coordinates found for ${cityName}`);
      const { lat, lon, name } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates!");
    });
};

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert("An error occurred while fetching the city name!");
        });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert("Geolocation request denied. Please reset location permission to grant access again.");
      } else {
        alert("Geolocation request error. Please reset location permission.");
      }
    }
  );
};

const rainContainer = document.createElement("div");
rainContainer.classList.add("rain");
for (let i = 0; i < 100; i++) {
  const raindrop = document.createElement("div");
  raindrop.classList.add("drop");
  raindrop.style.left = `${Math.random() * 100}vw`;
  raindrop.style.animationDuration = `${1 + Math.random()}s`;
  rainContainer.appendChild(raindrop);
}
document.body.appendChild(rainContainer);

searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", (e) => e.key === "Enter" && getCityCoordinates());

window.addEventListener('load', getUserCoordinates);

updateAdditionalInfo("__", "__");
updateVisibility("__");
