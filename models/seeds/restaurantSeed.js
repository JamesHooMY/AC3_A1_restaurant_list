const Restaurant = require('../restaurant')
const User = require('../user')
const restaurantList = require('./restaurants.json').results
const users = require('./users.json').results
const bcrypt = require('bcrypt')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const db = require('../../config/mongoose')

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Two Promise all method with checking repeat user in User >>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// db.once('open', () => {
//   Promise.all(
//     users.map(user => {
//       const { name, email, password, restaurantId } = user
//       return User.findOne({ email })
//         .then(user => {
//           if (!user) {
//             return bcrypt
//               .genSalt(10)
//               .then(salt => bcrypt.hash(password, salt))
//               .then(hash =>
//                 User.create({
//                   name,
//                   email,
//                   password: hash,
//                 })
//               )
//               .then(user => {
//                 const userId = user._id
//                 const restaurants = []
//                 return (
//                   Promise.all(
//                     restaurantId.map(id => {
//                       const restaurant = restaurantList.find(
//                         restaurant => restaurant.id === id
//                       )
//                       restaurant.userId = userId
//                       return restaurants.push(restaurant)
//                     })
//                   )
//                     .then(() => console.log(restaurants))
//                     .then(() => Restaurant.insertMany(restaurants))  // .then(() => Restaurant.create(restaurants))
//                     .catch(err => console.log(err))
//                 )
//               })
//               .catch(err => cosole.log(err))
//           } else {
//             return console.log(
//               `${user.name} ${user.email} is not created, who is already in database !`
//             )
//           }
//         })
//         .then()
//         .catch(err => console.log(err))
//     })
//   )
//     .then(() => {
//       console.log('User create done !')
//       process.exit()
//     })
//     .catch(err => console.log(err))
// })

// <<<<<<<<<<<<<<<<<<<<<<<< One Promise.all with checking repeat user in User >>>>>>>>>>>>>>>>>>>>>>>>
// db.once('open', () => {
//   Promise.all(
//     users.map((user, userIndex) => {
//       const { name, email, password } = user
//       return User.findOne({ email })
//         .then(user => {
//           if (!user) {
//             return bcrypt
//               .genSalt(10)
//               .then(salt => bcrypt.hash(password, salt))
//               .then(hash =>
//                 User.create({
//                   name,
//                   email,
//                   password: hash,
//                 })
//               )
//               .then(user => {
//                 const userId = user._id
//                 const userRestaurants = []
//                 restaurantList.forEach((restaurant, restaurantIndex) => {
//                   if (
//                     restaurantIndex >= 3 * userIndex &&
//                     restaurantIndex < 3 * (userIndex + 1)
//                   ) {
//                     restaurant.userId = userId // restaurant['userId'] = userId
//                     userRestaurants.push(restaurant)
//                   }
//                 })
//                 return Restaurant.create(userRestaurants)
//               })
//               .then(() =>
//                 console.log(
//                   `${name} ${email} database and who's related restaurants were separately created in User and Restaurant database`
//                 )
//               )
//               .catch(err => console.log(err))
//           } else {
//             return console.log(`${name} ${email} is already in database !`)
//           }
//         })
//         .catch(err => console.log(err))
//     })
//   )
//     .then(() => {
//       console.log('User and Restaurant create done !')
//       process.exit()
//     })
//     .catch(err => console.log(err))
// })

// <<<< Two Promise.all with async/await for checking repeat user and user specific restaurant in User and Restaurant >>>>
db.once('open', async () => {
  await Promise.all(
    users.map(async (user, userIndex) => {
      const { name, email, password } = user
      const findUser = await User.findOne({ email })
      // <<<<<<<<< if user not exist in User >>>>>>>>>
      if (!findUser) {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        const createdUser = await User.create({
          name,
          email,
          password: hash,
        })

        const userId = createdUser._id
        const userRestaurants = []

        restaurantList.forEach((restaurant, restaurantIndex) => {
          if (
            restaurantIndex >= 3 * userIndex &&
            restaurantIndex < 3 * (userIndex + 1)
          ) {
            restaurant.userId = userId // restaurant['userId'] = userId
            userRestaurants.push(restaurant)
          }
        })

        await Restaurant.create(userRestaurants)

        console.log(
          `${name} ${email} database and who's related restaurants were separately created in User and Restaurant database`
        )
      } else {
        // <<<<<<<<< if user exist in User, check restaurant in Restaurant >>>>>>>>>
        console.log(`${name} ${email} is already in database !`)

        const userId = findUser._id
        const userRestaurants = []
        const userRestaurantsNew = []
        restaurantList.forEach((restaurant, restaurantIndex) => {
          if (
            restaurantIndex >= 4 * userIndex &&
            restaurantIndex < 4 * (userIndex + 1)
          ) {
            restaurant.userId = userId
            userRestaurants.push(restaurant)
          }
        })

        await Promise.all(
          userRestaurants.map(async restaurant => {
            const findRestaurant = await Restaurant.findOne({
              userId,
              name: restaurant.name,
            })

            if (!findRestaurant) {
              userRestaurantsNew.push(restaurant)
            }
          })
        )
        await Restaurant.insertMany(userRestaurantsNew)
      }
    })
  )
  console.log('User and Restaurant create done !')
  process.exit()
})
