var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var addressSchema = new Schema({
  addressId: String,
  userName: String,
  streetName: String,
  postCode: String,
  tel: String,
  isDefault: {
    type: Boolean,
    default: false
  }
})

module.exports = addressSchema;