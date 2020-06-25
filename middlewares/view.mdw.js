const exphbs = require('express-handlebars');
const hbs_sections = require('express-handlebars-sections');
const moment = require('moment')

module.exports = function (app) {
  app.engine('hbs', exphbs({
    layoutsDir: 'views/_layouts',
    defaultLayout: 'main',
    partialsDir: 'views/_partials',
    extname: '.hbs',
    helpers: {
      section: hbs_sections(),
      getllDate: (date)=>{ return moment(date).format('ll')},
      getlllDate: (date)=>{ return moment(date).format('lll')},
    }
  }));
  app.set('view engine', 'hbs');
}
