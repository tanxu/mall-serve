var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
var productSchema = require('./../modules/goods')
var userSchema = require('./../modules/users')
var Goods = mongoose.model('Good', productSchema);
var User = mongoose.model('User', userSchema)


// 链接数据库
mongoose.connect('mongodb://127.0.0.1:27017/dumall')
// mongoose.connect('mongodb://root:123456127.0.0.1:27017/dumall')
mongoose.connection.on('connected', function (err, data) {
  console.log('connected success');
})

// 链接数据库失败
mongoose.connect('mongodb://127.0.0.1:27017/dumall')
// mongoose.connect('mongodb://root:123456127.0.0.1:27017/dumall')
mongoose.connection.on('error', function (err, data) {
  console.log('connected success');
})

// 链接数据库失败
mongoose.connect('mongodb://127.0.0.1:27017/dumall')
// mongoose.connect('mongodb://root:123456127.0.0.1:27017/dumall')
mongoose.connection.on('disconnected', function (err, data) {
  console.log('connected success');
})

// 查询商品列表
router.get('/list', function (req, res, next) {
  let page = parseInt(req.query.page);
  let pageSize = parseInt(req.query.pageSize);
  let priceLevel = req.query.priceLevel;
  var priceGt = '', priceLte = '';
  let params = {};
  if (priceLevel !== 'all') {
    switch (priceLevel) {
      case '0':
        priceGt = 0;
        priceLte = 500;
        break;
      case '1':
        priceGt = 500;
        priceLte = 1000;
        break;
      case '2':
        priceGt = 1000;
        priceLte = 2000;
        break;
      case '3':
        priceGt = 2000;
        priceLte = 8000;
        break;
    }
    params = {'salePrice': {$gt: priceGt, $lte: priceLte}}
  }
  let sort = req.query.sort;
  let skip = (page - 1) * pageSize;
  let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
  // 1shengxu    -1jiangxu
  goodsModel.sort({'salePrice': sort});
  goodsModel.exec(function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err,
        result: {}
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: {
          count: doc.length,
          data: doc
        }
      })
    }
  })
});

router.post('/addCart', function (req, res, next) {
  let userId = req.cookies.userId;
  let productId = req.body.productId;

  User.findOne({'userId': userId}, function (err, userdoc) {
    if (err) {
      res.json({
        status: '1',
        msg: 'error:' + err
      })
    } else {
      if (userdoc) {
        let goodItem = '';
        userdoc.cartList.forEach((item) => {
          if (item.productId === productId) {
            goodItem = item;
            item.productNum++;
            console.log('item', item)
          }
        })

        if (goodItem) {
          // 购物车存在此商品
          console.log('购物车存在此商品');
          userdoc.save(function (err2, doc2) {
            if (err2) {
              res.json({
                status: '1',
                msg: 'error:' + err2
              })
            } else {
              res.json({
                status: '0',
                msg: 'success',
                result: ''
              })
            }
          })
        } else {
          // 购物车不存在此商品
          console.log('购物车不存在此商品');
          Goods.findOne({'productId': productId}, function (err1, gooddoc) {
            if (err1) {
              res.json({
                status: '1',
                msg: err1.message,
                result: ''
              })
            } else {
              if (gooddoc) {
                gooddoc.productNum = 1;
                gooddoc.checked = true;
                userdoc.cartList.push(gooddoc);
                userdoc.save(function (err2, doc2) {
                  if (err2) {
                    res.json({
                      status: '1',
                      msg: err2.message,
                      result: ''
                    })
                  } else {
                    res.json({
                      status: '0',
                      msg: '添加购物车成功',
                      result: doc2
                    })
                  }
                })
              }
            }
          })
        }
      }
    }


  })

});


module.exports = router;
