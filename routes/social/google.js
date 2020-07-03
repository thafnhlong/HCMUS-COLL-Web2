const express = require('express');
const router = express.Router();
const moment = require('moment');
const axios = require('axios');
const passport = require('passport');
const Strategy  = require('passport-google-oauth').OAuth2Strategy;
const accountModel = require('../../models/account.model');
const config = require('../../config/default.json');

passport.use(new Strategy({
    clientID: '631916082783-ssdl9oatl0f5g0rt7q4brpbr2ecpg6nf.apps.googleusercontent.com',
    clientSecret: 'NZxD6IVeRAyS3S8YyVxB3w3e',
    callbackURL: `${config.site.url}/account/auth/google/callback`,
  },
  async function(accessToken, refreshToken, profile, cb) {
    var user = await accountModel.singleByEmail(`${profile.id}@google.com`);
    if (!user) {
      var birthdayJSON = {}
      try {
        const response = await axios.get(`https://people.googleapis.com/v1/people/${profile.id}?personFields=birthdays&access_token=${accessToken}`);
        birthdayJSON = response.data.birthdays.find(
          x=>x.metadata.source.type=='ACCOUNT'
        ).date;
      } catch (error) {
        return cb(error, null);
      }

      const userInfo = profile._json;
      user = {
        name: userInfo.name,
        email: `${userInfo.sub}@google.com`,
        dob: moment([birthdayJSON.year,birthdayJSON.month-1,
          birthdayJSON.day]).format('YYYY-MM-DD'),
        permisson: 1,
        password: '',
        expired: moment().add(7, 'days').toDate()
      }
      await accountModel.add(user);
    }
    cb(null, user);
  }
));

router.get('/',
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login',
          'https://www.googleapis.com/auth/user.birthday.read']
  })
);
router.get('/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/account'
  }),(req,res)=>{
    req.session.user = req.user
    res.redirect('/')
  }
);

module.exports=router