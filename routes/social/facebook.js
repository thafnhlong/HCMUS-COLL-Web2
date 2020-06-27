const express = require('express');
const router = express.Router();
const moment = require('moment');
const passport = require('passport');
const Strategy  = require('passport-facebook').Strategy;
const accountModel = require('../../models/account.model');
const config = require('../../config/default.json');

passport.use(new Strategy({
    clientID: 302406004290863,
    clientSecret: '6c0a4c341080ef94dce1cef7564df2da',
    callbackURL: `${config.site.url}/account/auth/facebook/callback`,
    profileFields: ['id', 'displayName', 'photos', 'email', 'birthday']
  },
  async function(accessToken, refreshToken, profile, cb) {
    var user = await accountModel.singleByEmail(`${profile.id}@fb.com`);
    if (!user) {
      const userInfo = profile._json;
      user = {
        name: userInfo.name,
        email: `${userInfo.id}@fb.com`,
        dob: moment(userInfo.birthday, 'MM/DD/YYYY').format('YYYY-MM-DD'),
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
  passport.authenticate('facebook', {
    scope: ['user_birthday']
  })
);
router.get('/callback',
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: '/account'
  }),(req,res)=>{
    req.session.user = req.user
    res.redirect('/')
  }
);

module.exports=router