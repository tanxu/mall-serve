var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
  "productId": String,
  "productName": String,
  "salePrice": Number,
  "productImg": String,
  "checked": {type: Boolean, default: false},
  "productNum": Number,
});

module.exports = mongoose.model('Good', productSchema);