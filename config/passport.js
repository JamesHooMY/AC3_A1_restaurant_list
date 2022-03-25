const passport = require('passport')
const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/user')

module.exports = app => {
  // 初始化 Passport 模組
  app.use(passport.initialize())
  app.use(passport.session())
  // 設定本地登入策略
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      User.findOne({ email })
        .then(user => {
          if (!user) {
            return done(null, false, {
              type: 'warning_msg',
              message: 'That email is not registered!',
            })
          }
          return bcrypt.compare(password, user.password).then(isMatch => {
            if (!isMatch) {
              return done(null, false, {
                type: 'warning_msg',
                message: 'Email or Password incorrect.',
              })
            }
            return done(null, user)
          })
          // 改成 bcrypt 驗證密碼
          // if (user.password !== password) {
          //   return done(null, false, {
          //     type: 'warning_msg',
          //     message: 'Email or Password incorrect.',
          //   })
          // }
          // return done(null, user)
        })
        .catch(err => done(err, false))
    })
  )
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRECT,
        callbackURL: process.env.FACEBOOK_CALLBACK,
        profileFields: ['email', 'displayName'], // 這部分一定要細看！！！
      },
      (accessToken, refreshToken, profile, done) => {
        const { name, email } = profile._json
        // console.log(profile)
        User.findOne({ email }).then(user => {
          if (user) return done(null, user)

          const randomPassword = Math.random().toString(36).slice(-8)

          bcrypt
            .genSalt(10)
            .then(salt => bcrypt.hash(randomPassword, salt))
            .then(hash =>
              User.create({
                name,
                email,
                password: hash,
              })
            )
            .then(user => done(null, user))
            .catch(err => done(err, false))
        })
      }
    )
  )

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRECT,
        callbackURL: process.env.GOOGLE_CALLBACK,
      },
      (accessToken, refreshToken, profile, done) => {
        const { name, email } = profile._json
        // console.log(profile)
        User.findOne({ email }).then(user => {
          if (user) return done(null, user) // 這裏 return 一定要加 ！！！

          const randomPassword = Math.random().toString(36).slice(-8)

          bcrypt
            .genSalt(10)
            .then(salt => bcrypt.hash(randomPassword, salt))
            .then(hash =>
              User.create({
                name,
                email,
                password: hash,
              })
            )
            .then(user => done(null, user))
            .catch(err => done(err, false))
        })
      }
    )
  )

  // 設定序列化與反序列化
  passport.serializeUser((user, done) => {
    done(null, user._id)
  })
  passport.deserializeUser((_id, done) => {
    User.findById(_id)
      .lean()
      .then(user => done(null, user))
      .catch(err => done(err, null))
  })
}
