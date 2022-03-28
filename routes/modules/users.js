const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcrypt')
const User = require('../../models/user')

router.get('/login', (req, res) => {
  res.render('login')
})

router.post(
  '/login',
  // passport middleware for checking login
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true, // connect-flash
  })
)

router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  const errors = []
  if (!name || !email || !password || !confirmPassword) {
    errors.push({ message: '所有欄位必填 !' })
  } else if (password !== confirmPassword) {
    errors.push({ message: '密碼與確認密碼不符 !' })
  }
  if (errors.length) {
    return res.render('register', {
      errors,
      name,
      email,
      password,
      confirmPassword,
    })
  }
  // check email in User
  User.findOne({ email }).then(user => {
    if (user) {
      errors.push({ message: '這個 email 已經注冊過了 !' })
      return res.render('register', {
        errors,
        name,
        email,
        password,
        confirmPassword,
      })
    }
    // bcrypt password
    return bcrypt
      .genSalt(10)
      .then(salt => bcrypt.hash(password, salt))
      .then(hash =>
        User.create({
          name,
          email,
          password: hash,
        })
      )
      .then(() => res.redirect('/'))
      .catch(err => cosole.log(err))
  })
})

router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', '您已經成功登出 ！')
  res.redirect('/users/login')
})

module.exports = router
