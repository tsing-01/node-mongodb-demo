const express = require('express');
const router = express.Router();
const dayjs = require('dayjs')
const model = require('../model');

/* GET home page. */
router.get('/', function(req, res, next) {
  const username = req.session.username || '';
  const pageIndex = req.query.pageIndex || 1
  const data = {
    total: 0,
    pageIndex: pageIndex,
    list: []
  }
  const pageSize = 2;

  model.run(mongo => {
    // select all articles
    mongo.collection('article').find().toArray().then((totalResult) => {
      data.total = Math.ceil(totalResult.length / pageSize);
      
      mongo.collection('article').find().sort({ _id: -1 }).limit(pageSize).skip((data. pageIndex - 1) * pageSize).toArray().then(result => {
        if(result.length == 0) {
          res.redirect('/?page=' + (pageIndex - 1 || 1))
        } else {
          const list = result;
          list.forEach(elem => {
            elem['publish_time'] = dayjs(elem.time).format('YYYY-MM-DD HH:mm:ss');
          });
          data.list = list;
          res.render('', {data: data, username: username} )
        }
      })
    }, () => {
      console.log('login error');
      res.redirect('/login');
    })
  })
});


// render register
router.get('/register', (req, res, next) => {
  res.render('register', {})
})

// render login
router.get('/login', (req, res, next) => {
  res.render('login', {})
})

// render writting
router.get('/write', (req, res, next) => {
  const username = req.session.username;
  const time = +req.query.time;
  const pageIndex = req.query.pageIndex;
  const item = {
    title: '',
    content: '',
    update_time: '',
    type: 1 // 1: add, 2: edit
  }
  if(time) {
    model.run(mongo => {
      mongo.collection('article').findOne({ time: time }, (err, result) => {
        if(err) {
          console.log('search article detial error');
        } else {
          Object.assign(item, result)
          item.type = 2;
          item.update_time = dayjs(item.update_time).format('YYYY-MM-DD HH:mm:ss');
          item[pageIndex] = pageIndex;
          res.render('write', { username: username, item: item })
        }
      })
    })
  } else {
    res.render('write', { username: username, item: item })
  }
})

// render detail
router.get('/detail', (req, res, next) => {
  const time = +req.query.time;
  const username = req.session.username;
  model.run(mongo => {
    mongo.collection('article').findOne({time: time}, (err, result) => {
      if(err) {
        console.log('search article detail error');
      } else {
        console.log('search article detail success');
        const item = {};
        Object.assign(item, result)
        item.update_time = dayjs(item.update_time).format('YYYY-MM-DD HH:mm:ss');
        console.log(item)
        res.render('detail', { username: username, item: item })
      }
    })
  })
})

module.exports = router;
