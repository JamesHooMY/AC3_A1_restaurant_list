const Restaurant = require('../restaurant')
const User = require('../user')
const restaurantList = require('../../restaurants.json').results
const bcrypt = require('bcrypt')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const db = require('../../config/mongoose') // !!! 這個一定要放在 require('dotenv') 之後 ！！！

const users = [
  {
    name: 'user1',
    email: 'user1@example.com',
    password: '12345678',
    restaurantId: [1, 2, 3],
  },
  {
    name: 'user2',
    email: 'user2@example.com',
    password: '12345678',
    restaurantId: [4, 5, 6],
  },
]

//------------------------------------------------------------- 先處理好資料，但浪費資源
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

db.once('open', () => {
  // create the data of restaurants.json in mongoDB
  Promise.all(
    // promise 内一定要塞 array 所以直接用 map 回傳帶入
    users.map(user => {
      const { name, email, password, restaurantId } = user
      return User.findOne({ email }) // 這個 return 是提供給 map 的，只要 => 有接 {}, 就必須指定 return
        .then(user => {
          if (!user) {
            return bcrypt // 這個 return 是提供給這層的 then
              .genSalt(10)
              .then(salt => bcrypt.hash(password, salt))
              .then(hash =>
                User.create({
                  name,
                  email,
                  password: hash,
                })
              )
              .then(user => {
                const userId = user._id
                const restaurants = []
                return Promise.all(
                  // 這個 return 是提供給這層的 then
                  restaurantId.map(id => {
                    const restaurant = restaurantList.find(
                      restaurant => restaurant.id === id
                    )
                    restaurant.userId = userId
                    return restaurants.push(restaurant) // 這個 return 是提供給 map 的
                  })
                )
                  .then(() => console.log(restaurants))
                  .then(() => Restaurant.insertMany(restaurants))
                  .catch(err => console.log(err))
              })
              .catch(err => cosole.log(err))
          } else {
            return console.log(
              `${user.name} ${user.email} is not created, who is already in database !`
            )
          }
        })
        .then()
        .catch(err => console.log(err))
    })
  )
    .then(() => {
      console.log('User create done !')
      process.exit()
    })
    .catch(err => console.log(err))

  // Restaurant.create(restaurantList)
  //   .then(() => {
  //     console.log('restaurantSeed done !!!')
  //     db.close()
  //     process.exit()
  //   })
  //   .catch(error => console.error(error))
})
