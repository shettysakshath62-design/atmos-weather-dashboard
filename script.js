// =====================================================
// ATMOS — WEATHER INTELLIGENCE
// Task 4 — Asynchronous JavaScript & RESTful APIs
// Powered by Open-Meteo
// =====================================================


// =====================================================
// GET HTML ELEMENTS
// =====================================================

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");

const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

const coordinates = document.getElementById("coordinates");

const weatherIcon = document.getElementById("weatherIcon");
const weatherDescription = document.getElementById("weatherDescription");

const localTime = document.getElementById("localTime");
const lastUpdated = document.getElementById("lastUpdated");

const errorMessage = document.getElementById("errorMessage");
const loading = document.getElementById("loading");
const weatherDashboard = document.getElementById("weatherDashboard");

const rainContainer = document.getElementById("rainContainer");
const weatherParticles = document.getElementById("weatherParticles");


// =====================================================
// QUICK WEATHER CARDS
// =====================================================

const quickTemperature =
    document.getElementById("quickTemperature");

const quickHumidity =
    document.getElementById("quickHumidity");

const quickWind =
    document.getElementById("quickWind");

const quickCondition =
    document.getElementById("quickCondition");


// =====================================================
// API CONFIGURATION
// =====================================================

const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";


// =====================================================
// WEATHER CODE INFORMATION
// =====================================================

function getWeatherInfo(code) {

    if (code === 0) {
        return {
            description: "Clear sky",
            icon: "☀️",
            className: "clear-weather"
        };
    }

    if (code === 1) {
        return {
            description: "Mainly clear",
            icon: "🌤️",
            className: "clear-weather"
        };
    }

    if (code === 2) {
        return {
            description: "Partly cloudy",
            icon: "⛅",
            className: "cloudy-weather"
        };
    }

    if (code === 3) {
        return {
            description: "Overcast",
            icon: "☁️",
            className: "cloudy-weather"
        };
    }

    if (code === 45 || code === 48) {
        return {
            description: "Foggy",
            icon: "🌫️",
            className: "fog-weather"
        };
    }

    if (code === 51 || code === 53 || code === 55) {
        return {
            description: "Drizzle",
            icon: "🌦️",
            className: "rainy-weather"
        };
    }

    if (code === 56 || code === 57) {
        return {
            description: "Freezing drizzle",
            icon: "🌧️",
            className: "rainy-weather"
        };
    }

    if (code === 61 || code === 63 || code === 65) {
        return {
            description: "Rain",
            icon: "🌧️",
            className: "rainy-weather"
        };
    }

    if (code === 66 || code === 67) {
        return {
            description: "Freezing rain",
            icon: "🌧️",
            className: "rainy-weather"
        };
    }

    if (code === 71 || code === 73 || code === 75 || code === 77) {
        return {
            description: "Snow",
            icon: "❄️",
            className: "cloudy-weather"
        };
    }

    if (code === 80 || code === 81 || code === 82) {
        return {
            description: "Rain showers",
            icon: "🌦️",
            className: "rainy-weather"
        };
    }

    if (code === 85 || code === 86) {
        return {
            description: "Snow showers",
            icon: "🌨️",
            className: "cloudy-weather"
        };
    }

    if (code === 95) {
        return {
            description: "Thunderstorm",
            icon: "⛈️",
            className: "storm-weather"
        };
    }

    if (code === 96 || code === 99) {
        return {
            description: "Thunderstorm with hail",
            icon: "⛈️",
            className: "storm-weather"
        };
    }

    return {
        description: "Unknown conditions",
        icon: "🌤️",
        className: "clear-weather"
    };
}


// =====================================================
// SEARCH BUTTON
// =====================================================

searchBtn.addEventListener("click", function () {

    const city = cityInput.value.trim();

    if (city === "") {
        showError("Please enter a city name.");
        return;
    }

    getWeatherByCity(city);
});


// =====================================================
// ENTER KEY SEARCH
// =====================================================

cityInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        event.preventDefault();

        searchBtn.click();
    }
});


// =====================================================
// GET WEATHER BY CITY
// =====================================================

async function getWeatherByCity(city) {

    showLoading(true);
    clearError();

    try {

        // -------------------------------------------------
        // GEOCODING
        // -------------------------------------------------

        let geocodingURL =
            GEOCODING_API +
            "?name=" +
            encodeURIComponent(city) +
            "&count=10" +
            "&language=en" +
            "&format=json";


        // -------------------------------------------------
        // SPECIAL CASE:
        // Mangalore must be searched in India.
        // This prevents Open-Meteo from selecting
        // Mangalore, Tasmania, Australia.
        // -------------------------------------------------

        if (city.trim().toLowerCase() === "mangalore") {

            geocodingURL =
                GEOCODING_API +
                "?name=Mangalore" +
                "&count=10" +
                "&language=en" +
                "&format=json" +
                "&countryCode=IN";
        }


        const locationResponse =
            await fetch(geocodingURL);


        if (!locationResponse.ok) {

            throw new Error(
                "Unable to connect to the location service."
            );
        }


        const locationData =
            await locationResponse.json();


        if (
            !locationData.results ||
            locationData.results.length === 0
        ) {

            throw new Error(
                "City not found. Please check the spelling."
            );
        }


        // -------------------------------------------------
        // SELECT LOCATION
        // -------------------------------------------------

        let location =
            locationData.results[0];


        // -------------------------------------------------
        // EXTRA SAFETY FOR MANGALORE
        // -------------------------------------------------

        if (city.trim().toLowerCase() === "mangalore") {

            const indianLocation =
                locationData.results.find(function (result) {

                    return (
                        result.country_code === "IN" &&
                        result.name &&
                        result.name.toLowerCase() === "mangalore"
                    );

                });


            if (indianLocation) {
                location = indianLocation;
            }
        }


        // -------------------------------------------------
        // WEATHER API
        // -------------------------------------------------

        const weatherURL =
            WEATHER_API +
            "?latitude=" +
            encodeURIComponent(location.latitude) +
            "&longitude=" +
            encodeURIComponent(location.longitude) +
            "&current=" +
            "temperature_2m," +
            "relative_humidity_2m," +
            "wind_speed_10m," +
            "weather_code" +
            "&timezone=auto";


        const weatherResponse =
            await fetch(weatherURL);


        if (!weatherResponse.ok) {

            throw new Error(
                "Unable to retrieve weather data."
            );
        }


        const weatherData =
            await weatherResponse.json();


        // -------------------------------------------------
        // DISPLAY WEATHER
        // -------------------------------------------------

        displayWeather(
            location,
            weatherData
        );


        // -------------------------------------------------
        // SAVE LAST SEARCHED CITY
        // -------------------------------------------------

        localStorage.setItem(
            "lastCity",
            city
        );

    }

    catch (error) {

        console.error(
            "Weather Error:",
            error
        );

        showError(
            error.message ||
            "Something went wrong. Please try again."
        );

        weatherDashboard.style.display =
            "none";
    }

    finally {

        showLoading(false);
    }
}


// =====================================================
// DISPLAY WEATHER
// =====================================================

function displayWeather(location, weatherData) {

    const current =
        weatherData.current;


    if (!current) {

        throw new Error(
            "Weather data is unavailable."
        );
    }


    // -------------------------------------------------
    // WEATHER INFORMATION
    // -------------------------------------------------

    const weatherInfo =
        getWeatherInfo(
            current.weather_code
        );


    // -------------------------------------------------
    // CITY
    // -------------------------------------------------

    cityName.textContent =
        location.name || "Unknown Location";


    // -------------------------------------------------
    // COUNTRY
    // -------------------------------------------------

    let countryText =
        location.country || "";


    if (location.admin1) {

        countryText +=
            " • " +
            location.admin1;
    }


    countryName.textContent =
        countryText;


    // -------------------------------------------------
    // TEMPERATURE
    // -------------------------------------------------

    const currentTemperature =
        Math.round(
            current.temperature_2m
        );


    temperature.textContent =
        currentTemperature;


    // -------------------------------------------------
    // HUMIDITY
    // -------------------------------------------------

    const currentHumidity =
        Math.round(
            current.relative_humidity_2m
        );


    humidity.textContent =
        currentHumidity;


    // -------------------------------------------------
    // WIND
    // -------------------------------------------------

    const currentWind =
        Math.round(
            current.wind_speed_10m
        );


    windSpeed.textContent =
        currentWind;


    // -------------------------------------------------
    // COORDINATES
    // -------------------------------------------------

    coordinates.textContent =
        Number(location.latitude).toFixed(2) +
        "° / " +
        Number(location.longitude).toFixed(2) +
        "°";


    // -------------------------------------------------
    // WEATHER ICON
    // -------------------------------------------------

    weatherIcon.textContent =
        weatherInfo.icon;


    // -------------------------------------------------
    // WEATHER DESCRIPTION
    // -------------------------------------------------

    weatherDescription.textContent =
        weatherInfo.description;


    // -------------------------------------------------
    // QUICK WEATHER CARDS
    // -------------------------------------------------

    updateQuickCards(
        currentTemperature,
        currentHumidity,
        currentWind,
        weatherInfo
    );


    // -------------------------------------------------
    // LOCAL TIME
    // -------------------------------------------------

    updateLocalTime(
        weatherData
    );


    // -------------------------------------------------
    // LAST UPDATED
    // -------------------------------------------------

    lastUpdated.textContent =
        new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    // -------------------------------------------------
    // WEATHER BACKGROUND
    // -------------------------------------------------

    setWeatherMode(
        weatherInfo.className
    );


    // -------------------------------------------------
    // SHOW DASHBOARD
    // -------------------------------------------------

    weatherDashboard.style.display =
        "block";
}


// =====================================================
// UPDATE QUICK WEATHER CARDS
// =====================================================

function updateQuickCards(
    currentTemperature,
    currentHumidity,
    currentWind,
    weatherInfo
) {

    if (quickTemperature) {

        quickTemperature.textContent =
            currentTemperature +
            " °C • Live surface temperature";
    }


    if (quickHumidity) {

        quickHumidity.textContent =
            currentHumidity +
            "% • Atmospheric moisture";
    }


    if (quickWind) {

        quickWind.textContent =
            currentWind +
            " km/h • Current wind activity";
    }


    if (quickCondition) {

        quickCondition.textContent =
            weatherInfo.icon +
            " " +
            weatherInfo.description;
    }
}


// =====================================================
// UPDATE LOCAL TIME
// =====================================================

function updateLocalTime(weatherData) {

    if (
        weatherData.current &&
        weatherData.current.time
    ) {

        const timeString =
            weatherData.current.time;


        const timePart =
            timeString.split("T")[1];


        if (timePart) {

            localTime.textContent =
                timePart.substring(0, 5);
        }

    } else {

        localTime.textContent =
            "--:--";
    }
}


// =====================================================
// WEATHER BACKGROUND MODE
// =====================================================

function setWeatherMode(className) {

    document.body.classList.remove(
        "clear-weather",
        "cloudy-weather",
        "rainy-weather",
        "storm-weather",
        "fog-weather"
    );


    document.body.classList.add(
        className
    );


    if (
        className === "rainy-weather" ||
        className === "storm-weather"
    ) {

        createRain();

    } else {

        clearRain();
    }
}


// =====================================================
// CREATE RAIN
// =====================================================

function createRain() {

    if (!rainContainer) {
        return;
    }


    rainContainer.innerHTML = "";


    const numberOfDrops = 90;


    for (
        let i = 0;
        i < numberOfDrops;
        i++
    ) {

        const drop =
            document.createElement("div");


        drop.className =
            "raindrop";


        drop.style.left =
            Math.random() * 100 +
            "%";


        drop.style.animationDuration =
            (0.5 + Math.random() * 0.8) +
            "s";


        drop.style.animationDelay =
            Math.random() * 2 +
            "s";


        drop.style.height =
            (40 + Math.random() * 45) +
            "px";


        rainContainer.appendChild(
            drop
        );
    }
}


// =====================================================
// CLEAR RAIN
// =====================================================

function clearRain() {

    if (!rainContainer) {
        return;
    }

    rainContainer.innerHTML = "";
}


// =====================================================
// CREATE ATMOSPHERIC PARTICLES
// =====================================================

function createParticles() {

    if (!weatherParticles) {
        return;
    }


    weatherParticles.innerHTML = "";


    const numberOfParticles = 25;


    for (
        let i = 0;
        i < numberOfParticles;
        i++
    ) {

        const particle =
            document.createElement("div");


        particle.className =
            "particle";


        particle.style.left =
            Math.random() * 100 +
            "%";


        particle.style.top =
            40 +
            Math.random() * 60 +
            "%";


        particle.style.animationDuration =
            (6 + Math.random() * 7) +
            "s";


        particle.style.animationDelay =
            Math.random() * 5 +
            "s";


        weatherParticles.appendChild(
            particle
        );
    }
}


// =====================================================
// LOADING
// =====================================================

function showLoading(show) {

    if (!loading) {
        return;
    }


    if (show) {

        loading.style.display =
            "block";

    } else {

        loading.style.display =
            "none";
    }
}


// =====================================================
// ERROR
// =====================================================

function showError(message) {

    if (!errorMessage) {
        return;
    }

    errorMessage.textContent =
        message;
}


// =====================================================
// CLEAR ERROR
// =====================================================

function clearError() {

    if (!errorMessage) {
        return;
    }

    errorMessage.textContent =
        "";
}


// =====================================================
// MY LOCATION BUTTON
// =====================================================

locationBtn.addEventListener(
    "click",
    function () {

        clearError();


        if (!navigator.geolocation) {

            showError(
                "Geolocation is not supported by your browser."
            );

            return;
        }


        showLoading(true);


        navigator.geolocation.getCurrentPosition(

            function (position) {

                const latitude =
                    position.coords.latitude;


                const longitude =
                    position.coords.longitude;


                getWeatherByCoordinates(
                    latitude,
                    longitude
                );
            },


            function (error) {

                showLoading(false);


                if (
                    error.code ===
                    error.PERMISSION_DENIED
                ) {

                    showError(
                        "Location permission was denied. Please allow location access in Chrome."
                    );

                } else if (
                    error.code ===
                    error.POSITION_UNAVAILABLE
                ) {

                    showError(
                        "Your location could not be determined."
                    );

                } else {

                    showError(
                        "Unable to get your location."
                    );
                }
            }
        );
    }
);


// =====================================================
// GET WEATHER BY COORDINATES
// =====================================================

async function getWeatherByCoordinates(
    latitude,
    longitude
) {

    try {

        // -------------------------------------------------
        // WEATHER API
        // -------------------------------------------------

        const weatherURL =
            WEATHER_API +
            "?latitude=" +
            encodeURIComponent(latitude) +
            "&longitude=" +
            encodeURIComponent(longitude) +
            "&current=" +
            "temperature_2m," +
            "relative_humidity_2m," +
            "wind_speed_10m," +
            "weather_code" +
            "&timezone=auto";


        const weatherResponse =
            await fetch(weatherURL);


        if (!weatherResponse.ok) {

            throw new Error(
                "Unable to retrieve weather data."
            );
        }


        const weatherData =
            await weatherResponse.json();


        // -------------------------------------------------
        // REVERSE GEOCODING
        // -------------------------------------------------

        const reverseURL =
            GEOCODING_API +
            "?latitude=" +
            encodeURIComponent(latitude) +
            "&longitude=" +
            encodeURIComponent(longitude) +
            "&count=1" +
            "&language=en" +
            "&format=json";


        const reverseResponse =
            await fetch(reverseURL);


        let location = {

            name: "Your Location",

            country: "",

            admin1: "",

            latitude: latitude,

            longitude: longitude
        };


        if (reverseResponse.ok) {

            const reverseData =
                await reverseResponse.json();


            if (
                reverseData.results &&
                reverseData.results.length > 0
            ) {

                location =
                    reverseData.results[0];
            }
        }


        // -------------------------------------------------
        // DISPLAY
        // -------------------------------------------------

        displayWeather(
            location,
            weatherData
        );

    }

    catch (error) {

        console.error(
            "Location Weather Error:",
            error
        );


        showError(
            error.message ||
            "Unable to retrieve weather for your location."
        );


        weatherDashboard.style.display =
            "none";

    }

    finally {

        showLoading(false);
    }
}


// =====================================================
// LOAD LAST SEARCHED CITY
// =====================================================

function loadLastCity() {

    const savedCity =
        localStorage.getItem(
            "lastCity"
        );


    if (savedCity) {

        cityInput.value =
            savedCity;


        getWeatherByCity(
            savedCity
        );

    } else {

        // Default city

        cityInput.value =
            "Mangalore";


        getWeatherByCity(
            "Mangalore"
        );
    }
}


// =====================================================
// INITIALIZE PARTICLES
// =====================================================

createParticles();


// =====================================================
// INITIAL WEATHER LOAD
// =====================================================

loadLastCity();
