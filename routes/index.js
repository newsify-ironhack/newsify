const News = require('../models/New');
const Comment = require('../models/Comment');
const Like = require('../models/Like');

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

  app.get('/profile', isLoggedIn, async (req, res) => {
    const allNews = await News.find({owner: req.user.id}).populate({path: 'comments', populate: {path: 'user'}})

    allNews.forEach( (art) => {
      if(art.likes.indexOf(req.user._id) !== -1) {
        art.liked = true
      } else {
        art.liked = false
      }
    })

    res.render('profile', {allNews, user: req.user, comments: allNews.comments})
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
  app.get('/trending/:page',(req,res,next)=>{
    let pageToFind = Number(req.params.page);
    newsapi.v2.topHeadlines({country: 'us', page: pageToFind})
    .then((response) => {
     res.json({response: response.articles, user: req.user});
  })
  .catch((err)=>{
    res.json(err);
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
  app.get('/:topic/:page',(req,res,next)=>{
    let pageToFind = Number(req.params.page);
    let topic = req.params.topic;
    newsapi.v2.everything({q: topic, page: pageToFind})
    .then((response) => {
      res.json({response: response.articles, user: req.user});
   })
   .catch((err)=>{
     res.json(err);
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
      console.log(response);
      response.articles.forEach((e)=>{
        let date = e.publishedAt;
        let modifiedDate = date.substring(0,10);
        e.publishedAt = modifiedDate;
      })
    console.log(req.user);
    res.render('news',{allNews: response.articles, topic: 'Music', user: req.user})
  })
  .catch((err)=>{
    next(err);
    })
    
  })
  
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.post('/news/create', async (req, res,next) => {
    const { title, description, picture, author, articleUrl, articleDate } = req.body;
    try {
      const newArticle = await News.create({ owner: req.user, title, description, picture, author, articleUrl, articleDate });


    } catch(err) {
      console.log(err)
    }
  //   .then((response)=>{
  //     res.json(response);
  // })
  //   .catch((err)=>{
  //     res.json(err);
  //   })
  })

  app.post('/news/delete',(req,res,next)=>{
    News.findOneAndRemove({title: req.body.title})
    .then((response)=>{
      res.json(response);
    })
    .catch((err)=>{
      res.json(err);
    })
  });

  app.post('/comment/create', async (req, res) => {
    const { title, content } = req.body;

    try {
      const getNew = await News.findOne({title})
      const newComment = await Comment.create({user: req.user._id, article: getNew._id, content})

      getNew.comments.push(newComment._id)
      await getNew.save()

      res.json({
        ok: true,
        data: {
          user: req.user,
          message: 'Comment submitted'
        }
      })

    } catch(err) {
      res.json({
        ok: false,
        data: 'Something went wrong'
      })
    }
  });

  app.post('/likes/add', async (req, res) => {
    const  { title } = req.body;
    try {
      await News.findOneAndUpdate({title}, {$push: {likes: req.user._id}})
      
      res.json({
        ok: true,
        message: 'Liked'
      })  
    } catch(err) {
      console.log(err)
    }

  })

  app.post('/likes/remove', async (req, res) => {
    const { title } = req.body;

    try {
      await News.findOneAndUpdate({title}, {$pull: {likes: req.user._id}})

      res.json({
        ok: true,
        message: 'Disliked'
      })

    } catch(err) {
      console.log(err)
    }
  })
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  } else {
      res.redirect('/')
  }
}



