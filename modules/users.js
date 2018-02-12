var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var productSchema = require('./goods')
var addressSchema = require('./address')
var orderSchema = require('./../modules/order')
var userSchema = new Schema({
  "userId": String,
  "userName": String,
  "userPwd": String,
  "orderList": [
    orderSchema
  ],
  "cartList": [
    productSchema
  ],
  "addressList": [
    addressSchema
  ]
})

module.exports = userSchema
