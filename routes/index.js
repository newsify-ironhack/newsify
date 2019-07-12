module.exports = function(app, passport) {
  app.get('/', (req, res, next) => {
    console.log(req.flash())
    res.render('homepage');
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
  }))

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
  }))

  app.get('/auth/linkedin', passport.authenticate('linkedin', { state: true }));

  app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
  }));

  app.get('/profile', (req, res) => {
    console.log(req.flash())
    res.render('profile')
  })
}


