var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
var User = require('../modules/users')

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
      status: '1',
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

module.exports = router;
