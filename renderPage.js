const date = require(__dirname + '/date.js')
const weather = require('./weatherDb.js');

exports.renderPage = function (pageToDisplay, listTitle, items, isLoggedIn, res) {

    weather.Model.findOne({
        city: "Sandi"
    }, (err, data) => {
        if (!err) {
            res.render(pageToDisplay, {
                currTime: date.formatAMPM(),
                newItem: items,
                ListTitle: listTitle,
                KindofDay: date.getDate(),
                temperature: data.temperature,
                img_url: data.weatherIconUrl,
                weatherDescription: data.weatherDescription,
                isLoggedIn: isLoggedIn
            });
        } else {
            console.log(err);
        }
    });
}