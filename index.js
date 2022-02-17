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

app.use(express.json());

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
      res.status(400).json({ error: error.message });
    });

  //res.send(req.params);
});

app.get('/webhook', function (req, res) {
  res.json(buildReponse('get webhook'));
});

app.post('/webhook', function (req, res) {
  // console.log('req.body', req.body);
  let city = 'hannover';
  let day = 'today';
  let url = '';
  if (req.body.queryResult && req.body.queryResult.allRequiredParamsPresent) {
    let q = req.body.queryResult;
    let intent = q.intent.displayName;
    switch (intent) {
      case 'query weather':
        city = q.parameters['geo-city'];
        url = BASEURL + 'weather/?q=' + city + '&lang=en&APPID=' + WEATHERTOKEN;
        break;
      default:
        url = BASEURL + 'weather/?q=' + city + '&lang=en&APPID=' + WEATHERTOKEN;
        break;
    }

    if (url) {
      axios
        .get(url)
        .then(function (response) {
          out = buildDayWeatherResponse(response.data, day, city);
          res.json(out);
        })
        .catch(function (error) {
          res.json(buildReponse('error'));
        });
    } else {
      res.json(buildReponse('somethin else'));
    }
  } else {
    res.json(buildReponse('not enogh info'));
  }
});

function buildReponse(speech) {
  //let out = { speech: speech, displayText: speech, data: null };
  let out = {
    fulfillmentMessages: [
      {
        text: {
          text: [speech],
        },
      },
    ],
  };

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
