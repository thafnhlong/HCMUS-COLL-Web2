const express = require('express');
require('express-async-errors');
const config = require('./config/default.json')

const app = express();

app.use(express.urlencoded({
  extended: true
}));

app.use('/public', express.static('public'));

require('./middlewares/locals.mdw')(app);
require('./middlewares/view.mdw')(app);
require('./middlewares/session.mdw')(app);

app.use('/dashboard',require('./routes/dashboard'))

app.get('/', function (req, res) {
  res.render('home');
})

app.use(function (req, res) {
  res.status(404).render('404');
})

app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).render('500');
})

app.listen(config.site.port, () => {
  console.log(`Server is running at ${config.site.url}`);
})