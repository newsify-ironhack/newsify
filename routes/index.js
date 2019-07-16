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
    News.find({owner: req.user.id}).populate({path: 'comments', populate: {path: 'user'}})
      .then((allNews) => {
        if(allNews.likes) {
          res.render('profile', {allNews, user: req.user, comments: allNews.comments, likes: allNews.likes, likesNum: allNews.likes.length})
        } else {
          res.render('profile', {allNews, user: req.user, comments: allNews.comments, likes: [], likesNum: 0})
        }
      })
      .catch(err => {
        console.log(err)
      })
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

  app.post('/news/create', (req, res,next) => {
    News.create({
      owner: req.user,
      title: req.body.title,
      description: req.body.description,
      picture: req.body.picture,
      author: req.body.author,
      articleUrl: req.body.articleUrl,
      articleDate: req.body.articleDate
    })
    .then((response)=>{
      res.json(response);
  })
    .catch((err)=>{
      res.json(err);
    })
    
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

    } catch(err) {
      console.log(err)
    }
  });

  app.post('/likes/add', async (req, res) => {
    const  { title } = req.body;
    try {
      const updatedNew = await News.findOne({title})
      const newLike = await Like.create({ user: req.user._id, article: updatedNew._id })

      updatedNew.likes.push(newLike._id);
      await updatedNew.save()

    } catch(err) {
      console.log(err)
    }

  })

  app.post('/likes/remove', async (req, res) => {
    const { title } = req.body;

    try {
      const oneNew = await News.findOne({title})
      const removedLike = await Like.findOneAndRemove({$and: [{user: req.user._id}, {article: oneNew._id}]})
      const updatedNew = await News.findOneAndUpdate({title}, {$pull: {likes: removedLike._id }})
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



