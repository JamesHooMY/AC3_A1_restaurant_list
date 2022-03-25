const mongoose = require('mongoose')
const Schema = mongoose.Schema

// data type identification
const restaurantSchema = new Schema({
  name: { type: String, required: true },
  name_en: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  location: { type: String, required: true },
  phone: { type: String, required: true },
  google_map: { type: String, required: true },
  rating: { type: Number, required: true },
  description: { type: String, required: true },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // 從 User DB 抓取 ObjectId
    index: true, // 增加 index 讓 database 更快查找和匹配資料
    required: true,
  },
})

module.exports = mongoose.model('restaurant', restaurantSchema)
