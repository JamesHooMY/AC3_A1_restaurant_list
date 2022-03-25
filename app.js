const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const methodOverride = require('method-override') // function for ?_method=PUT and ?_method=DELETE

const app = express()
const port = 3000

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
    secret: 'ThisIsMySecret',
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
app.use((req, res, next) => {
  // 你可以在這裡 console.log(req.user) 等資訊來觀察
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.user = req.user
  next() // this next() direct to continue process next middleware app.use(routes)
})
app.use(routes) // router connection

// router listener
app.listen(port, () => {
  console.log(`express is listening on localhost: ${port}`)
})
