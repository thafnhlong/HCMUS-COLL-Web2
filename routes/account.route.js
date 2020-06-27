const express = require('express');
const router = express.Router();
const accountModel = require('../models/account.model');
const config = require('../config/default.json');
const sendmail = require('../utils/sendmail');
const bcrypt = require('bcryptjs');
const moment = require('moment')

router.get('/logout', (req, res) => { 
  req.session.user = null
  res.redirect('/') 
})

router.use((req,res,next)=>{
  if (req.session.user)
    return res.redirect('/')
  next()
})

router.get('/', (req, res) => { res.redirect('/account/login') })

router.get('/login', async function (req, res) {
    res.render('vwAccount/login', { layout: false })
})
router.post('/login', async function (req, res) {
    const user = await accountModel.singleByEmail(req.body.email);
    if (req.body.email == '' || req.body.password == '') {
        return res.render('vwAccount/login', {
            layout: false,
            err: 'Bạn chưa điền mật khẩu hoặc email'
        })
    }
    if (user === null) {
        return res.render('vwAccount/login', {
            layout: false,
            err: 'Không tìm thấy tài khoản'
        })
    }
    const rs = bcrypt.compareSync(req.body.password, user.password);
    if (rs === false) {
        return res.render('vwAccount/login', {
            layout: false,
            err: 'Mật khẩu không đúng'
        })
    }
    req.session.user = user
    res.redirect('/')
})

router.use('/auth/facebook', require('./social/facebook'))
router.use('/auth/google', require('./social/google'))

router.get('/register', async function (req, res) {
    res.render('vwAccount/register', { layout: false })

})
router.post('/register', async function (req, res) {

    const user = await accountModel.singleByEmail(req.body.email);
    const Age = moment() - moment(req.body.dob, 'DD/MM/YYYY')
    if (user) {
        res.render('vwAccount/register', {
            layout: false,
            err: "Email đã có người dùng !!"
        });
    }
    else if (req.body.name == '' || req.body.email == '' || req.body.dob == '' ||
        req.body.password == '' || req.body.cf_password == '' || req.body.permisson == '') {
        res.render('vwAccount/register', {
            layout: false,
            err: "Bạn phải điền đầy đủ thông tin !!"
        });
    }
    else if (+Age < 0) {
        res.render('vwAccount/register', {
            layout: false,
            err: "Ngày sinh không hợp lệ"
        });
    }
    else if (req.body.password != req.body.cf_password) {
        res.render('vwAccount/register', {
            layout: false,
            err: "Nhập lại mật khẩu không đúng !!"
        });
    }
    else if (req.body.permisson == 2 && req.body.pseudonym == '') {
        res.render('vwAccount/register', {
            layout: false,
            err: "Bạn phải điền đầy đủ thông tin !!"
        });
    }
    else {
        const account ={
            name: req.body.name,
            email: req.body.email,
            dob: moment(req.body.dob, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            permisson: req.body.permisson,
        }
        const password_hash = bcrypt.hashSync(req.body.password, config.authentication.saltRounds);
        account.password= password_hash

        if (req.body.permisson == '1') {
            account.expired = moment().add(7, 'days').toDate();
        }
        if (req.body.permisson == '2') {
            account.pseudonym = req.body.pseudonym;
        }

        await accountModel.add(account);
        res.redirect('/account')
    };

})

router.get('/forgot-password', async function (req, res) {
    res.render('vwAccount/forgot-password', { layout: false })
})
router.post('/forgot-password', async function (req, res) {
    if (req.body.email === '') {
        return res.render('vwAccount/forgot-password', {
            layout: false,
            err: 'Vui lòng nhập email'
        })
    }
    const user = await accountModel.singleByEmail(req.body.email);
    if (user === null) {
        return res.render('vwAccount/forgot-password', {
            layout: false,
            err: 'Không tìm thấy tài khoản'
        })
    }
    user.verifycode = Math.floor(Math.random() * (900000) + 100000)
    user.expiredcode = moment().add(30, 'm').toDate()

    await accountModel.patch(user);

    sendmail.sendmail(req.body.email, user.name, user.verifycode)

    res.redirect('/account/recover')
})

router.get('/recover', async function (req, res) {
    const code = req.query.code;
    if (code) {
        const account = await accountModel.singleByCode(code);
        if (account === null) {
            return res.render('vwAccount/recover', { layout: false, err: `Mã xác nhận không đúng hoặc đã hết thời gian` });
        }
        return res.redirect(`/account/reset-password?code=${code}`)
    }
    else if (code == '') {
        return res.render('vwAccount/recover', { layout: false, err: `Bạn chưa điền mã xác thực` });
    }
    res.render('vwAccount/recover', { layout: false });
})

router.get('/reset-password', async function (req, res) {
    const code = req.query.code;
    if (code) {
        const account = await accountModel.singleByCode(code);
        if (account === null) {
            return res.redirect('/account')
        }
        return res.render('vwAccount/reset-password', { layout: false })
    }
    res.redirect('/account')
})
router.post('/reset-password', async function (req, res) {
    const code = req.query.code;
    if (code) {
        const account = await accountModel.singleByCode(code);
        if (account === null) {
            return res.redirect('/account/login')
        }

        if (req.body.password == '' || req.body.cf_password == '') {
            return res.render('vwAccount/reset-password', {
                layout: false,
                err: 'Vui lòng điền đầy đủ mật khẩu'
            })
        }
        if (req.body.password != req.body.cf_password) {
            return res.render('vwAccount/reset-password', {
                layout: false,
                err: 'Mật khẩu không khớp'
            })
        }
        const password_hash = bcrypt.hashSync(req.body.password, config.authentication.saltRounds);
        account.password = password_hash
        account.verifycode = null
        account.expiredcode = null
        await accountModel.patch(account);
    }
    res.redirect('/account')
})

module.exports = router