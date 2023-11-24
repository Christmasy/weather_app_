const report = document.querySelector(".report");
const applicantPopup = document.getElementById('popup__box');
const weatherPopup = document.getElementById("popup");

applicantPopup.addEventListener('submit', handlePopupSubmit);
document.getElementById('coords').addEventListener('mousedown', getGeolocation);
document.addEventListener('mousedown', onClose);

const setReportError = () => report.textContent = "Упс! Не получается определить геолокацию";
function getGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(handleLocationMy, setReportError);
  }  else {
    setReportError()
  }
}

async function handleLocationMy(position) {
  const { longitude, latitude }  = position.coords;
  const response = await fetchData(latitude, longitude);
  render(response);
}

const padZero = (num) => (num < 10) ? "0" + num : num;
function convertTimezoneToUTC(timezone) {
  var hours = Math.floor(Math.abs(timezone) / 3600);
  var minutes = Math.floor((Math.abs(timezone) % 3600) / 60);
  var sign = (timezone < 0) ? "-" : "+";
  var formattedTimezone = sign + padZero(hours) + ":" + padZero(minutes);
  return formattedTimezone;
}

function onOpen() {
  weatherPopup.style.display = "flex";
}

function onClose(e) {
  if(e.target.closest('.popup') === null){
    weatherPopup.style.display = 'none';
  }
}

async function handlePopupSubmit(e) {
  e.preventDefault();
  const dataForm = new FormData(e.target);
  const response = await fetchData(dataForm.get("lat"), dataForm.get("long"));
  render(response)
}

const fetchData = async (lat, long) => {
  try {
    const result = await
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=2931438045cd03cbd77760fecb7fd68b&lang=ru`);
    return await result.json();
  } catch (e) {
    report.textContent = "Упс! Непредвиденная ошибка";
  }
}

function render(response) {
  if (!response) {
    return null;
  }
  weatherPopup.style.display = "none";
  document.getElementById("city_name").textContent = response.name;
  document.getElementById("weather__container").innerHTML = getWeatherInfo(response);
  renderMap(response);
}

const getTemperature = (w) => Math.floor(w.main.temp - 273);
const getWeatherInfo = (weatherData) => {
  return `<div class="weather__inner">
            <h2 class="weather__temperature"><span>${getTemperature(weatherData)}</span>&deg</h2>
            <img class="weather__icon" src="https://openweathermap.org/img/w/${weatherData.weather[0].icon}.png" alt="Значок погоды">
          </div>
          <ul class="weather-info__list">
            <li class="weather-info__item">
                <span>Часовой пояс:</span>
                <p>${convertTimezoneToUTC(weatherData.timezone)} UTC</p>
            </li>
            <li class="weather-info__item">
                <span>Ветер:</span>
                <p>${weatherData.wind.speed} м/с</p>
            </li>
            <li class="weather-info__item">
                <span>Давление:</span>
                <p>${weatherData.main.pressure} мм рт. ст.</p>
            </li>
            <li class="weather-info__item">
                <span>Влажность:</span>
                <p>${weatherData.main.humidity} %</p>
            </li>
            <li class="weather-info__item">
                <span>Облачность:</span>
                <p>${weatherData.clouds.all} %</p>
            </li>
          </ul>`
}

function renderMap(data) {
  document.getElementById("map").innerHTML = "";
  const latitude = data.coord.lat
  const longitude = data.coord.lon
  ymaps.ready(function () {
    let myMap = new ymaps.Map('map', {
          center: [latitude, longitude],
          zoom: 15,
        }, {
          searchControlProvider: 'yandex#search'
        }),

        placemark = new ymaps.Placemark(myMap.getCenter(), {
          hintContent: 'Метка расположения',
        }, {
          iconLayout: 'default#image',
          iconImageHref: 'images/location.svg'
        });
    myMap.geoObjects.add(placemark);
  });
}