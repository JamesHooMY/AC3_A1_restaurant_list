const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const methodOverride = require('method-override') // function for ?_method=PUT and ?_method=DELETE
const flash = require('connect-flash')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const app = express()
const port = process.env.PORT

const routes = require('./routes') // router
require('./config/mongoose') // mongoose connection
const usePassport = require('./config/passport')

// setting handlebars
app.engine(
  'hbs',
  exphbs({
    defaultLayout: 'main',
    extname: 'hbs',
  })
)
app.set('view engine', 'hbs')

// session
app.use(
  session({
    secret: process.env.SESSION_SECRECT,
    resave: false,
    saveUninitialized: true,
  })
)
// use css & js
app.use(express.static('public'))
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true })) // Express include the body-parser from version 4.16.0
usePassport(app) // passport verification
// this part for getting the information of passport verification
app.use(flash())
app.use((req, res, next) => {
  // 你可以在這裡 console.log(req.user) 等資訊來觀察
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.user = req.user
  // 從 flash 暫存空間裏的 success_msg 提取訊息存入 locals 的 success_msg, 訊息取出后 flash 的暫存空間就會清空
  res.locals.success_msg = req.flash('success_msg')
  res.locals.warning_msg = req.flash('warning_msg')
  next() // this next() direct to continue process next middleware app.use(routes)
})
app.use(routes) // router connection

// router listener
app.listen(port, () => {
  console.log(`express is listening on localhost: ${port}`)
})
