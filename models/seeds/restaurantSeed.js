const Restaurant = require('../restaurant')
const User = require('../user')
const restaurantList = require('./restaurants.json').results
const users = require('./users.json').results
const bcrypt = require('bcrypt')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const db = require('../../config/mongoose') // !!! 這個一定要放在 require('dotenv') 之後 ！！！

// const users = [
//   {
//     name: 'user1',
//     email: 'user1@example.com',
//     password: '12345678',
//     restaurantId: [1, 2, 3],
//   },
//   {
//     name: 'user2',
//     email: 'user2@example.com',
//     password: '12345678',
//     restaurantId: [4, 5, 6],
//   },
// ]

//------------------------------------------------------------- 先處理好資料
// users.forEach(user => {
//   const restaurants = []
//   user.restaurantId.forEach(id => {
//     const restaurant = restaurantList.find(restaurant => restaurant.id === id)
//     restaurants.push(restaurant)
//   })
//   user.restaurants = restaurants
// })
// users.forEach(user => console.log(user.restaurants))
//-------------------------------------------------------------

// ------------------------------- Two Promise all method --------------------------------------
// db.once('open', () => {
//   // create the data of restaurants.json in mongoDB
//   Promise.all(
//     // promise 内一定要塞 array 所以直接用 map 回傳帶入
//     users.map(user => {
//       const { name, email, password, restaurantId } = user
//       return User.findOne({ email }) // 這個 return 是提供給 map 的，只要 => 有接 {}, 就必須指定 return
//         .then(user => {
//           if (!user) {
//             return bcrypt // 這個 return 是提供給這層的 then
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
//                     // 這個 return 是提供給這層的 then
//                     restaurantId.map(id => {
//                       const restaurant = restaurantList.find(
//                         restaurant => restaurant.id === id
//                       )
//                       restaurant.userId = userId
//                       return restaurants.push(restaurant) // 這個 return 是提供給 map 的
//                     })
//                   )
//                     .then(() => console.log(restaurants))
//                     // .then(() => Restaurant.create(restaurants))
//                     .then(() => Restaurant.insertMany(restaurants))
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
// ----------------------------------------------------------------------------------------------

// 考慮到 server 通常都會直接找 database 要一次資料後直接在 server 上做處理后 render，避免一直訪問 DB 浪費時間
// 直接透過演算法來處理 restaurant 的資料
// Promise.all.then()-------------------------------------------------------------------------------
// db.once('open', () => {
//   // 這裏設計以 create User 資料的同時接著 create 餐廳資料，2 輪回以 User.map 來做
//   Promise.all(
//     // promise 内一定要塞 array 所以直接用 map 回傳帶入
//     users.map((user, userIndex) => {
//       // const { name, email, password, restaurantId } = user
//       const { name, email, password } = user
//       // 這裏要確認 user 沒有在 DB 内重複 ！！！
//       return User.findOne({ email }) // 這個 return 是提供給 map 的，只要 => 有接 {}, 就必須指定 return
//         .then(user => {
//           if (!user) {
//             return bcrypt // 這個 return 是提供給這層的 then
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
//                 // 在此拿到 user._id !!! 開始可以接續做 Restaurant.create() 或 Restaurant.insertMany()
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
// ---------------------------------------------------------------------------------------------------------

// async/await
db.once('open', async () => {
  // 這裏設計以 create User 資料的同時接著 create 餐廳資料，2 輪回以 User.map 來做
  await Promise.all(
    // promise 内一定要塞 array 所以直接用 map 回傳帶入
    users.map(async (user, userIndex) => {
      // const { name, email, password, restaurantId } = user
      const { name, email, password } = user
      // 這裏要確認 user 沒有在 DB 内重複 ！！！
      const findUser = await User.findOne({ email }) // 這個 return 是提供給 map 的，只要 => 有接 {}, 就必須指定 return

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

        // console.log(userId)
        // 這部分用來確認已有的 user，並確認需要新增的 restaurant 是否有重複
        await Promise.all(
          // 因爲這裏有 multiple promise 所以一定要用到 promise.all 不能只靠 async await 來單獨處理 ！！！！！！！
          userRestaurants.map(async (restaurant, restaurantIndex) => {
            console.log(restaurantIndex + ' ' + restaurant.name)
            const findRestaurant = await Restaurant.findOne({
              userId,
              name: restaurant.name,
            })

            if (!findRestaurant) {
              console.log(restaurantIndex)
              userRestaurantsNew.push(restaurant)
            }
          })
        )
        console.log(userId + ' ' + userRestaurantsNew)
        await Restaurant.insertMany(userRestaurantsNew)
      }
      console.log('next')
    })
  )
  console.log('User and Restaurant create done !')
  process.exit()
})
