var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
var userSchema = require('./../modules/users')
var User = mongoose.model('User', userSchema)
const orderUtil = require('./../utils/createOrderNumber')


/* GET users listing. */
router.post('/login', function (req, res, next) {
  let user = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  User.findOne(user, function (err, userDoc) {
    if (err) {
      res.json({
        status: '1',
        msg: 'error:' + err,
        result: ''
      })
    } else {
      if (userDoc) {

        res.cookie("userId", userDoc.userId, {
          path: '/',
          maxAge: 1000 * 60 * 60
        });
        res.cookie("userName", userDoc.userName, {
          path: '/',
          maxAge: 1000 * 60 * 60
        });

        res.json({
          status: '0',
          msg: '登录成功',
          result: {
            userName: userDoc.userName
          }
        })
      } else {
        res.json({
          status: '1',
          msg: '用户名密码错误',
          result: ''
        })
      }
    }
  })

});

router.post('/logout', function (req, res, next) {
  console.log('logout')
  res.clearCookie("userId");
  res.clearCookie("userName");
  res.json({
    status: '0',
    msg: '登出成功',
    result: ''
  })
})

router.get('/check', function (req, res, next) {
  if (req.cookies.userId && req.cookies.userId !== 'undefined') {
    // 已经登录
    User.findOne({'userId': req.cookies.userId}, function (err, userDoc) {
      if (err) {
        res.json({
          status: '1',
          msg: err,
          result: ''
        })
      } else {
        if (userDoc) {
          res.json({
            status: '0',
            msg: err,
            result: userDoc
          })
        }
      }
    })
  } else {
    // 没登录
    res.json({
      status: '2',
      msg: '未登录',
      result: ''
    })
  }
})

router.get('/cartList', function (req, res, next) {
  let userId = req.cookies.userId;
  User.findOne({userId}, function (err, userDoc) {
    if (err) {
      res.json({
        status: '1',
        msg: err,
        result: '',
      })
    } else {
      if (userDoc) {
        res.json({
          status: '0',
          msg: '',
          result: userDoc.cartList
        })
      }
    }
  })
})

router.post('/cart/del', function (req, res, next) {
  let userId = req.cookies.userId;
  let productId = req.body.productId;
  User.update({userId}, {$pull: {cartList: {'productId': productId}}}, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err,
        result: ''
      })
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: "删除成功",
          result: doc
        })
      }
    }
  })
})

router.post('/cart/edit', (req, res, next) => {
  let productId = req.body.productId, checked = req.body.checked, productNum = req.body.productNum,
      userId = req.cookies.userId;
  checked = checked === 'false' ? false : true
  User.update({userId, 'cartList.productId': productId}, {
    'cartList.$.productNum': productNum,
    'cartList.$.checked': checked
  }, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err,
        status: ''
      })
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '修改成功',
          result: doc
        })
      }
    }
  })
})

router.post('/cart/checkAll', (req, res, next) => {
  let userId = req.cookies.userId;
  let checkAll = req.body.checkAll === 'true' ? true : false;
  User.findOne({userId}, (err, userDoc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err,
        result: ''
      })
    } else {
      userDoc.cartList.forEach(item => {
        item.checked = checkAll
      })
      userDoc.save(function (err1, doc) {
        if (err1) {
          res.json({
            status: '1',
            msg: err1,
            result: ''
          })
        } else {
          res.json({
            status: '0',
            msg: 'success',
            result: doc
          })
        }
      })
    }
  })
})

router.get('/address/list', (req, res, next) => {
  let userId = req.cookies.userId;
  User.findOne({userId}, (err, userDoc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err,
        result: ''
      })
    } else {
      if (userDoc) {
        res.json({
          status: '0',
          msg: '',
          result: userDoc.addressList
        })
      }
    }
  })
})

router.post('/address/del/one', (req, res, next) => {
  let userId = req.cookies.userId, addressId = req.body.addressId;
  User.update({userId}, {$pull: {'addressList': {'addressId': addressId}}}, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: 'success',
          result: doc
        })
      }
    }
  })
})

router.post('/address/setDefault', (req, res, next) => {
  let userId = req.cookies.userId, addressId = req.body.addressId;
  User.findOne({userId}, (err, userDoc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (userDoc) {
        let addressList = userDoc.addressList;
        addressList.forEach((item) => {
          if (item.addressId === addressId) {
            item.isDefault = true;
          } else {
            item.isDefault = false;
          }
        })
        userDoc.save((err, doc) => {
          if (err) {
            res.json({
              status: '1',
              msg: err.message,
              result: ''
            })
          } else {
            if (doc) {
              res.json({
                status: '0',
                msg: 'set default address success',
                result: ''
              })
            }
          }
        })
      }
    }
  })
})

router.post('/order/create', (req, res, next) => {
  let userId = req.cookies.userId, addressId = req.body.addressId, subtotal = req.body.subtotal,
      shipping = req.body.shipping, discount = req.body.discount, tax = req.body.tax, total = req.body.total;
  User.findOne({userId}, (err, userDoc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (userDoc) {
        let address = {}, goodList = [], orderId = orderUtil();
        userDoc.addressList.forEach(item => {
          if (item.addressId === addressId) {
            address = item
          }
        })
        userDoc.cartList.filter(item => {
          if (item.checked) {
            goodList.push(item)
          }
        })
        userDoc.orderList.push({
          orderId: orderId,
          orderTotal: total,
          addressInfo: address,
          goodsList: goodList,
        });
        userDoc.save((err1, doc1) => {
          if (err1) {
            res.json({
              status: '1',
              msg: err1.message,
              result: ''
            })
          } else {
            if (doc1) {
              res.json({
                status: '0',
                msg: '',
                result: {
                  orderId: orderId,
                  orderTotal: total
                }
              })
            }
          }
        })
      }
    }
  })
})

router.get('/order/details', (req, res, next) => {
  let userId = req.cookies.userId, orderId = req.query.orderId;
  User.findOne({userId}, (err, userDoc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (userDoc) {
        let orderInfo = {};
        userDoc.orderList.forEach(item => {
          if (item.orderId === orderId) {
            orderInfo = item;
          }
        })
        if (orderInfo) {
          // 存在此订单
          res.json({
            status: '0',
            msg: '',
            result: orderInfo
          })
        } else {
          // 不存在此订单
          res.json({
            status: '101',
            msg: '不存在此订单',
            result: ''
          })
        }
      }
    }
  })
})

router.get('/cart/count', (req, res, next) => {
  if (req.cookies && req.cookies.userId) {
    let userId = req.cookies.userId;
    User.findOne({userId}, (err, userDoc) => {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        })
        return next(err);
      } else {
        let cartList = userDoc.cartList;
        let cartCount = 0;
        cartList.forEach(item => {
          cartCount += item.productNum
        })
        res.json({
          status: '0',
          msg: 'suc',
          result: {
            count: cartCount
          }
        })
      }
    })
  }
})


module.exports = router;
