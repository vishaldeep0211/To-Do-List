function fetchMostRecentData() {
    fetch("/fetchWeatherData")
      .then(response => response.json())
      .then(data => updateView(data))
      .catch(err => showError(err));
  }
  
  function updateView(data) {
    const weatherDiv = document.getElementsByClassName("weather-description")[0];
    // console.log(weatherDiv.children[1]);

    weatherDiv.children[0].innerHTML = `${data.temperature} &deg;C`;
    weatherDiv.children[1].innerHTML = `${data.weatherDescription}`;

    const weatherImg = document.getElementsByClassName("weather-img");
    // console.log(weatherImg.src);
    weatherImg.src = `${data.weatherIconUrl}`
  }
  
  function showError(err) {
    console.error(err);
  }

  setInterval(fetchMostRecentData, 900000);

  function updateTime(){
    fetch("/fetchTime")
      .then(response => response.json())
      .then(data => updateTimeField(data))
      .catch(err => showError(err));
  }

  function updateTimeField(data){
    const time = document.getElementsByClassName("time")[0].firstElementChild;
    // console.log(time);
    time.innerHTML = `${data.time}`;
  }

  setInterval(updateTime, 1000);