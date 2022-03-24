const Restaurant = require('../restaurant')
const restaurantList = require('../../restaurants.json').results
const db = require('../../config/mongoose')

db.once('open', () => {
  console.log('mongodb connected!')

  // create the data of restaurants.json in mongoDB
  Restaurant.create(restaurantList)
    .then(() => {
      console.log('restaurantSeed done !!!')
      db.close()
    })
    .catch(error => console.error(error))
})
