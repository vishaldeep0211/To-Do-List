function fetchMostRecentData() {
    fetch("/fetchWeatherData")
      .then(response => response.json())
      .then(data => updateView(data))
      .catch(err => showError(err));
  }
  
  function updateView(data) {
    let tempHeading = document.getElementById("temperature");
    tempHeading.innerHTML = `${data.temperature} &deg;C`;

    let weatherPara = document.getElementById("weatherDescription");
    weatherPara.innerHTML = `${data.weatherDescription}`;

    let weatherImg = document.getElementById("weather-img");
    weatherImg.innerHTML = `<img class="weather-img" src="${data.weatherIconUrl}" alt="Weather-icon">`;
  }
  
  function showError(err) {
    console.error(err);
  }

  setInterval(fetchMostRecentData, 600000);

  function updateTime(){
    fetch("/fetchTime")
      .then(response => response.json())
      .then(data => updateTimeField(data))
      .catch(err => showError(err));
  }

  function updateTimeField(data){
    time.innerHTML = `${data.time}`;
  }

  setInterval(updateTime, 100);