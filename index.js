const express = require('express');
const axios = require('axios');
const path = require('path');
const PORT = process.env.PORT || 5000;

const WEATHERTOKEN = 'f7d3994664f54bca15ae725c41668485';
const BASEURL = 'http://api.openweathermap.org/data/2.5/';

const app = express();

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

app.get('/home', (req, res, next) => {
  res.send('<h1>Welcome. :)</h1>');
});

app.get('/hjson', (req, res, next) => {
  res.json({ answer: 42 });
});

app.get('/home/:varr', (req, res) => {
  let city = req.params.varr;
  let url = BASEURL + 'weather/?q=' + city + '&lang=en&APPID=' + WEATHERTOKEN;

  console.log(req.params.varr, url);

  axios
    .get(url)
    .then(function (response) {
      out = buildDayWeatherResponse(response.data, 'today', city);
      res.json(out);
    })
    .catch(function (error) {
      console.log('error', error);
    });

  // request.get(url, function (error, response, body) {
  //   var json = JSON.parse(body);
  //   out = buildDayWeatherResponse(json, 'today', city);
  //   console.log(body, out);
  //   res.json(out);
  // });

  //res.send(req.params);
});

app.post('/webhook', function (req, res) {
  let action = req.body.result.action;
  switch (action) {
    case 'query_openweathermap':
      let city = req.body.result.parameters['City'];
      let url =
        BASEURL + 'weather/?q=' + city + '&lang=en&APPID=' + WEATHERTOKEN;
      axios
        .get(url)
        .then(function (response) {
          out = buildDayWeatherResponse(response.data, 'today', city);
          res.json(out);
        })
        .catch(function (error) {
          res.json(buildReponse('error'));
        });
      break;
  }
});

function buildReponse(speech) {
  let out = { speech: speech, displayText: speech, data: null };
  return out;
}

function buildDayWeatherResponse(owmResponse, day, city) {
  let desc = owmResponse.weather[0].description;
  let temp_min = owmResponse.main.temp_min - 273.15;
  let temp_max = owmResponse.main.temp_max - 273.15;

  let speech =
    day +
    ', in ' +
    city +
    ' the weather is : ' +
    desc +
    ' with temperatures between ' +
    temp_min.toPrecision(3) +
    ' and ' +
    temp_max.toPrecision(3) +
    ' Celsius degrees';
  return buildReponse(speech);
}
