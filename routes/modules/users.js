const express = require('express')
const router = express.Router()
const passport = require('passport')

const User = require('../../models/user')

router.get('/login', (req, res) => {
  res.render('login')
})

router.post(
  '/login',
  // 加入 middleware passport，驗證 request 登入狀態
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
  // 取得註冊表單參數
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
  // 檢查使用者是否已經註冊
  User.findOne({ email }).then(user => {
    // 如果已經註冊：退回原本畫面
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
    // 如果還沒註冊：寫入資料庫
    return User.create({
      name,
      email,
      password,
    })
      .then(() => res.redirect('/'))
      .catch(err => console.log(err))
  })
})

router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', '您已經成功登出 ！')
  res.redirect('/users/login')
})

module.exports = router
