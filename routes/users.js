const express = require('express');
const router = express.Router();
const model = require('../model')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', (req, res, next) => {
  const data = {
    username: req.body.username,
    password: req.body.password,
    password2: req.body.password2
  }
  model.run(mongo => {
    mongo.collection('users').insertOne(data, (error, ret) => {
      if(error) {
        console.log('register error!')
        res.redirect('/register')
      } else {
        console.log('register success')
        res.redirect('/login')
      }
    })
  }) 
})

// login in
router.post('/login', (req, res, next) => {
  const data = {
    username: req.body.username,
    password: req.body.password
  }

  model.run(mongo => {
    mongo.collection('users').find(data).toArray().then(result => {
      if(result.length > 0) {
        // session store
        req.session.regenerate(err => {
          if(err) next(err)
        })
        req.session.username = data.username;

        req.session.save(err => {
          if(err) return next(err);
        })
        res.redirect('/');
      }
    }, () => {
      console.log('login error');
      res.redirect('/login');
    })
  })
  
})


// login out
router.get('/logout', (req, res, next) => {
  req.session.user = null;
  req.session.save(function (err) {
    if (err) next(err)

    // regenerate the session, which is good practice to help
    // guard against forms of session fixation
    req.session.regenerate(function (err) {
      if (err) next(err)
      res.redirect('/login')
    })
  })
})

module.exports = router;
 