module.exports = function(app, passport,newsapi) {
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

  app.get('/profile', isLoggedIn, (req, res) => {
    console.log(req.user)
    console.log(req.flash())

    newsapi.v2.everything({q: 'technology'})
    .then((response) => {
      res.render('profile',{allNews: response.articles, topic: 'Tech', user: req.user})
    })
    .catch((err)=>{
      next(err);
    })
  })

  app.get('/trending',(req,res,next)=>{
    newsapi.v2.topHeadlines({country: 'us'})
    .then((response) => {
        console.log(response)
        res.render('news',{allNews: response.articles, topic: 'Trending'})
    })
    .catch((err)=>{
      next(err);
    })
  })

  app.get('/sports',(req,res,next)=>{
    newsapi.v2.everything({q: 'sports'})
    .then((response) => {
    console.log(response);
    res.render('news',{allNews: response.articles, topic: 'Sports'})
  })
  .catch((err)=>{
    next(err);
    })
  })

  app.get('/health',(req,res,next)=>{
    newsapi.v2.everything({q: 'health'})
    .then((response) => {
    console.log(response);
    res.render('news',{allNews: response.articles, topic: 'Health'})
  })
  .catch((err)=>{
    next(err);
    })
  })

  app.get('/tech',(req,res,next)=>{
    newsapi.v2.everything({q: 'technology'})
    .then((response) => {
      console.log(response);
      res.render('news',{allNews: response.articles, topic: 'Tech'})
    })
    .catch((err)=>{
      next(err);
    })
  })

  app.get('/music',(req,res,next)=>{
    newsapi.v2.everything({q: 'music'})
    .then((response) => {
    console.log(response); 
    res.render('news',{allNews: response.articles, topic: 'Music'})
  })
  .catch((err)=>{
    next(err);
    })
  })

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/')
    }
  }
}


