var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var orderSchema = new Schema({
  orderId: String,
  orderTotal: Number,
  addressInfo: Object,
  goodsList: Array,
  orderStatus: {
    type:String,
    default:'1'
  },
  createData: {
    type: Date,
    default: Date.now
  }
})

module.exports = orderSchema;