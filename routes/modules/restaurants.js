const express = require('express')
const router = express.Router()

const Restaurant = require('../../models/restaurant')

// render search restaurants
router.get('/search', (req, res) => {
  const keyword = req.query.keyword.trim().toLowerCase()
  let querySort = req.query.sort
  const sortOpts = [
    { innerText: 'A - Z', sortOpt: { name: 1 } },
    { innerText: 'Z - A', sortOpt: { name: -1 } },
    { innerText: '類別', sortOpt: { category: 1 } },
    { innerText: '地區', sortOpt: { location: 1 } },
  ]
  // console.log(keyword)
  // console.log(querySort)
  // 將 selected 推入相對應的 object 中, 再透過 {{#if selected}} 在 views 顯示相對應的 option
  sortOpts.find(sort => sort.innerText === querySort).selected = 'selected'
  let sortOpt = sortOpts.find(sort => sort.innerText === querySort).sortOpt
  // console.log(sortOpts)
  const userId = req.user._id
  return Restaurant.find({ userId })
    .lean()
    .sort(sortOpt)
    .then(restaurants =>
      restaurants.filter(
        restaurant =>
          // includes(null) 會回傳整個 array
          restaurant.name.trim().toLowerCase().includes(keyword) ||
          restaurant.name_en.trim().toLowerCase().includes(keyword)
      )
    )
    .then(searchRestaurants =>
      res.render('index', {
        restaurants: searchRestaurants,
        keyword,
        sortOpts,
      })
    )
})

// render new page for adding restaurant
router.get('/new', (req, res) => {
  res.render('new')
})

// add new restaurant
router.post('/', (req, res) => {
  const userId = req.user._id
  const restaurant = req.body
  restaurant.userId = userId // restaurant['userId'] = userId
  // console.log(restaurant)
  return Restaurant.create(restaurant)
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

// render detail page of restaurant
router.get('/:restaurant_id', (req, res) => {
  const userId = req.user._id
  const restaurantId = req.params.restaurant_id
  return Restaurant.findOne({ restaurantId, userId })
    .lean()
    .then(restaurant => res.render('show', { restaurant }))
    .catch(error => console.log(error))
})

// render edit page of restaurant
router.get('/:restaurant_id/edit', (req, res) => {
  const userId = req.user._id
  const restaurantId = req.params.restaurant_id
  return Restaurant.findOne({ restaurantId, userId })
    .lean()
    .then(restaurant => res.render('edit', { restaurant }))
    .catch(error => console.log(error))
})

// update restaurant information
router.put('/:restaurant_id', (req, res) => {
  const restaurantId = req.params.restaurant_id
  const userId = req.user._id
  const restaurant = req.body
  // Restaurant.findByIdAndUpdate(restaurantId, restaurant)
  return Restaurant.findOneAndUpdate({ restaurantId, userId }, restaurant)
    .then(() => res.redirect(`/restaurants/${restaurantId}`))
    .catch(error => console.log(error))
})

// delete restaurant
router.delete('/:restaurant_id', (req, res) => {
  const restaurantId = req.params.restaurant_id
  return Restaurant.findByIdAndDelete(restaurantId)
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

module.exports = router
