module.exports = function(app, passport,newsapi) {
  app.get('/', (req, res, next) => {
    console.log(req.flash())
    res.render('homepage', {user: req.user});
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
    console.log(req.user)
    console.log(req.flash())
    res.render('profile', {user: req.user})
  })

  app.get('/trending',(req,res,next)=>{
    newsapi.v2.topHeadlines({country: 'us'})
    .then((response) => {
      response.articles.forEach((e)=>{
        let date = e.publishedAt;
        let modifiedDate = date.substring(0,10);
        e.publishedAt = modifiedDate;
      })
    res.render('news',{allNews: response.articles, topic: 'Trending', user: req.user})
  })
  .catch((err)=>{
    next(err);
  })
})
app.get('/sports',(req,res,next)=>{
  newsapi.v2.everything({q: 'sports'})
  .then((response) => {
    response.articles.forEach((e)=>{
      let date = e.publishedAt;
      let modifiedDate = date.substring(0,10);
      e.publishedAt = modifiedDate;
    })
  res.render('news',{allNews: response.articles, topic: 'Sports', user: req.user})
})
.catch((err)=>{
  next(err);
  })
})
app.get('/health',(req,res,next)=>{
  newsapi.v2.everything({q: 'health'})
  .then((response) => {
    response.articles.forEach((e)=>{
      let date = e.publishedAt;
      let modifiedDate = date.substring(0,10);
      e.publishedAt = modifiedDate;
    })
  res.render('news',{allNews: response.articles, topic: 'Health', user: req.user})
})
.catch((err)=>{
  next(err);
  })
})
app.get('/tech',(req,res,next)=>{
  newsapi.v2.everything({q: 'technology'})
  .then((response) => {
    response.articles.forEach((e)=>{
      let date = e.publishedAt;
      let modifiedDate = date.substring(0,10);
      e.publishedAt = modifiedDate;
    })
  res.render('news',{allNews: response.articles, topic: 'Tech', user: req.user})
})
.catch((err)=>{
  next(err);
  })
})
app.get('/music',(req,res,next)=>{
  newsapi.v2.everything({q: 'music'})
  .then((response) => {
    response.articles.forEach((e)=>{
      let date = e.publishedAt;
      let modifiedDate = date.substring(0,10);
      e.publishedAt = modifiedDate;
    })
  res.render('news',{allNews: response.articles, topic: 'Music', user: req.user})
})
.catch((err)=>{
  next(err);
  })
})

}


