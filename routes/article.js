const express = require('express');
const router = express.Router();
const model = require('../model')
const multiparty = require('multiparty')
const fs = require('fs')


router.post('/add', (req, res, next) => {
  const data = {
    title: req.body.title,
    content: req.body.content,
    time: Date.now(),
    update_time: Date.now(),
    author: req.session.username || 'no name'
  }

  model.run(mongo => {
    mongo.collection('article').insertOne(data, (err, ret) => {
      if(err) {
        console.log('article publish error')
        res.redirect('/write')
      } else {
        res.redirect('/')
      }
    })
  })
})

router.post('/edit', (req, res, next) => {
  const time = +req.body.time;
  const pageIndex = req.body.pageIndex;
  model.run(mongo => {
    mongo.collection('article').updateOne({ time: time }, {
      $set: {
        title: req.body.title,
        content: req.body.content,
        update_time: Date.now(),
        time: time
      }
    }, (err, ret) => {
      console.log('err-----', err, ret)
      if(err) {
        console.log('edit article error');
      } else {
        console.log('edit article success');
      }
      res.redirect('/?pageIndex=' + pageIndex);
    })
  })
})

router.get('/delete', (req, res, next) => {
  const time = +req.query.time;
  const pageIndex = req.query.pageIndex;
  model.run(mongo => {
    mongo.collection('article').deleteOne({ time: time }, (err, ret) => {
      console.log(ret)
      if(err) {
        console.log('delete article error');
      } else {
        console.log('delete article success');
      }
      res.redirect('/?pageIndex=' + pageIndex);
    })
  })
})

router.post('/upload', (req, res, next) => {
  const form = new multiparty.Form();
  // content-type multipart/form-data
  form.parse(req, (err, fields, files) => {
    if(err) {
      console.log('upload error');
    } else {
      const file = files.filedata[0];
      const rs = fs.createReadStream(file.path)
      const newPath = '/uploads/' + file.originalFilename
      const ws = fs.createWriteStream('./public' + newPath)
      rs.pipe(ws)
      ws.on('close', () => {
        console.log('file upload success');
        res.send({ err: '', msg: newPath});
      })
    }
  })
})

module.exports = router;
 