require('dotenv').config();
const https = require('https');
const _ = require('lodash');
const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
    city: String,
    temperature: String,
    weatherDescription: String,
    weatherIconUrl: String
});

const Weather = mongoose.model("Weather", weatherSchema);

exports.Model = Weather;

exports.updateWeatherData = function () {
    console.log("Updating Weather Data");
    const city = "Sandi"
    const url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + process.env.APIKEY + "&units=metric";
    https.get(url, response => {
        response.on("data", data => {

            const weatherData = JSON.parse(data);
            const icon = weatherData.weather[0].icon;
            const img_url = "http://openweathermap.org/img/wn/" + icon + "@2x.png"

            const jsonWeatherData = {
                temperature: Math.round(weatherData.main.temp),
                weatherDescription: _.startCase(weatherData.weather[0].description),
                weatherIconUrl: img_url
            }

            Weather.updateOne({
                    city: "Sandi"
                }, {
                    $set: jsonWeatherData
                },
                function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Successfully Updated !!");
                    }
                }
            );
        });
    });

}