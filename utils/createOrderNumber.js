let SHOP_ID = '652'
let r1 = Math.floor(Math.random() * 10)
let r2 = Math.floor(Math.random() * 10)
let time = new Date().getTime();

function createOrderNo() {
  return SHOP_ID + r1 + r2 + time;
}

module.exports = function () {
  return SHOP_ID + r1 + r2 + time;
}