const express = require('express');
require('express-async-errors');

const app = express();

app.use(express.urlencoded({
  extended: true
}));
app.use('/public', express.static('public'));

require('./middlewares/session.mdw')(app);
require('./middlewares/view.mdw')(app);
require('./middlewares/locals.mdw')(app);


//app.use('/admin/categories', require('./routes/category.route'));


app.get('/', function (req, res) {
  res.send('LTWEB2')
})

app.get('/err', function (req, res) {
  throw new Error('123')
})

app.use(function (req, res) {
  res.render('404', { layout: false });
})

app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).render('500', { layout: false });
})

const PORT = 3000;
app.listen(PORT, function () {
  console.log(`Server is running at http://localhost:${PORT}`);
})