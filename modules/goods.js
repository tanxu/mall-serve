var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
  "productId": String,
  "productName": String,
  "salePrice": Number,
  "productImage": String,
  "checked": {type: Boolean, default: false},
  "productNum": Number,
});

module.exports = productSchema;