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
      isEqual: (a,b) => a==b,
      formatDate: (date,format) => {return moment(date).format(format)},
      parseSection: (type,option,object) => {
        const navOption = object.data.root._locals.navOption
        if (!navOption) return false
        if (type == navOption.type){
          if (option && option != navOption.option)
            return false
          return true
        }
        return false
      },
    }
  }));
  app.set('view engine', 'hbs');
}
