const express = require('express');
require('express-async-errors');
const config = require('./config/default.json')

//TIME ZONE:
process.env.TZ = "Asia/Ho_Chi_Minh"

const app = express();

app.use(express.urlencoded({
  extended: true
}));

app.use('/public', express.static('public'));

require('./middlewares/view.mdw')(app);
require('./middlewares/session.mdw')(app);
require('./middlewares/locals.mdw')(app);

app.use('/dashboard',require('./routes/dashboard.route'))

app.use('/',require('./routes/home.route'))
app.use('/search',require('./routes/search.route'))
app.use('/category',require('./routes/category.route'))
app.use('/tag',require('./routes/tag.route'))
app.use('/post',require('./routes/post.route'))

app.use('/account',require('./routes/account.route'))

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