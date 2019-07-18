const News = require('../models/New');
const Comment = require('../models/Comment');
// const Like = require('../models/Like');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const nodemailer = require('../config/nodemailer');

module.exports = function(app, passport, newsapi) {
  app.get("/", (req, res, next) => {
    newsapi.v2.topHeadlines({ country: "us" })
      .then((response)=>{
        res.render("index", { 
          user: req.user, 
          allNews: response.articles, 
          wrongEmailAndUsername: req.flash('wrongEmailAndUsername')[0],
          wrongUsername: req.flash('wrongUsername')[0],
          wrongEmail: req.flash('wrongEmail')[0],
          loginMessage: req.flash('loginMessage')[0],
          passSuccess: req.flash('passSuccess')[0],
          error: req.flash('error')[0]
        }
      );
    })
    .catch((err)=>{
      next(err);
    })
  });

  app.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/profile",
      failureRedirect: "/",
      failureFlash: true
    })
  );

  app.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/profile",
      failureRedirect: "/",
      failureFlash: true
    })
  );

  app.get("/auth/linkedin", passport.authenticate("linkedin", { state: true }));

  app.get(
    "/auth/linkedin/callback",
    passport.authenticate("linkedin", {
      successRedirect: "/profile",
      failureRedirect: "/",
      failureFlash: true
    })
  );

  app.get("/profile", isLoggedIn, async (req, res) => {
    let allNews = await News.find({ owner: req.user.id }).populate({
      path: "comments",
      populate: { path: "user" }
    });
    let x = await User.findById(req.user._id).populate("following");
    allNews = allNews.reverse();
    let allUsers = x.following;
    let numOfArticles = allNews.length;
    let followers = x.followers.length;
    allNews.forEach(art => {
      if (art.likes.indexOf(req.user._id) !== -1) {
        art.liked = true;
      } else {
        art.liked = false;
      }
    });

    res.render("profile", {
      allNews,
      user: req.user,
      comments: allNews.comments,
      allUsers: allUsers,
      numOfArticles: numOfArticles,
      followers: followers
    });
  });

  app.get('/password/recover/:id', async(req, res, next) => {
    const id = req.params.id;

    try {
      const userDB = await User.findById(id)

      if(userDB.recover) {
        res.render("passRecoverForm", {userID: userDB._id, validPass: true, passErr: req.flash('passErr')[0]})
      } else {
        res.redirect('/')
      }
    } catch(err) {
      next(err)
    }
  });

  app.post('/password/recover/:id', async (req, res, next) => {
    const { oldPassword, newPassword, newPassword2 } = req.body
    const id = req.params.id;

    console.log(req.body, id)

    try {
      const userDB = await User.findById(id)

      if(userDB.recover) {
        console.log('There is a recover code')
        if(userDB.validatePassword(oldPassword) && newPassword === newPassword2) {
          userDB.password = userDB.generateHash(newPassword);
          delete userDB.recover;

          await userDB.save();
          console.log('Password changed !')
          req.flash('passSuccess', true)
          res.redirect('/')
        } else {
          console.log('Passwords do not match')
          req.flash('passErr', 'Passwords do not match')
          res.redirect(`/password/recover/${userDB._id}`)
        }
      } else {
        res.redirect('/')
      }

    } catch(err) {
      next(err)
    }
  })

  app.get('/password/confirm-code/:id', async (req, res, next) => {
    const id = req.params.id;
    try {
      const userDB = await User.findById(id);

      if(userDB.recover) {
        res.render("confirmCode", {userID: userDB._id, verified: true, codeErr: req.flash('codeErr')[0]});
      } else {
        res.redirect('/')
      }
    } catch(err) {
      next(err)
    }
  });

  app.post('/password/confirm-code/:id', async (req, res, next) => {
    const id = req.params.id;
    const code = req.body.tempCode;

    try {
      const userDB = await User.findById(id)

      if(userDB) {
        if(userDB.recover === code) {
          res.redirect(`/password/recover/${userDB._id}`, {verified: true, userID: userDB._id})
        } else {
          req.flash('codeErr', 'The code do not match')
          res.redirect(`/password/recover/${userDB._id}`)
        }
      } else {
        res.redirect('/')
      }
    } catch(err) {
      next(err)
    }
  })

  app.get('/password/confirm-email', (req, res) => {
    res.render("confirmEmailForm")
  });

  app.post('/password/confirm-email', async (req, res, next) => {
    const { email } = req.body; 
    try {
      const userDB = await User.findOne({email})

      if(userDB) {
        if(!userDB.linkedin) {
          const code = Math.floor(1000 + Math.random() * 9000);
  
          nodemailer.sendMail({
            from: 'Newsify DONOTREPLY',
            to: userDB.email,
            subject: 'Password recover',
            html: `<div><h2>Change your password</h2><p>Use ${code} for changin your password</p></div>`
          })
            .then(async response => {
              userDB.recover = code;
              await userDB.save()
              res.redirect(`/password/confirm-code/${userDB._id}`)
            })
            .catch(err => {
              next(err)
            })
        } else {
          res.redirect('/')
        }
      }
    } catch(err) {
      next(err)
    }
  })

  app.get("/profile/:otherUserId", async (req, res, next) => {
    try {
      let allNews = await News.find({ owner: req.params.otherUserId }).populate(
        { path: "comments", populate: { path: "user" } }
      );
      const user = await User.findById(req.params.otherUserId);
      allNews = allNews.reverse();
      let isFollowing = false;
      let x = await User.findById(req.params.otherUserId).populate("following");
      let allUsers = x.following;
      let numOfArticles = allNews.length;
      let followers = user.followers.length;
      
      if (req.user) {
        allUsers.forEach((e, i) => {
          if (e._id.equals(req.user._id)) {
            allUsers.splice(i, 1);
          }
        });
        allNews.forEach(art => {
          if (art.likes.indexOf(req.user._id) !== -1) {
            art.liked = true;
          } else {
            art.liked = false;
          }
        });
        if (req.user.following.includes(req.params.otherUserId)) {
          isFollowing = true;
        }
      }
      res.render("other-user-profile", {
        allNews,
        otheruser: user,
        comments: allNews.comments,
        allUsers: allUsers,
        user: req.user,
        isFollowing: isFollowing,
        numOfArticles: numOfArticles,
        followers: followers
      });
    } catch (err) {
      next(err);
    }
  });

  app.get("/trending", (req, res, next) => {
    newsapi.v2
      .topHeadlines({ country: "us" })
      .then(response => {
        response.articles.forEach(e => {
          let date = e.publishedAt;
          let modifiedDate = date.substring(0, 10);
          e.publishedAt = modifiedDate;
        });
        res.render("news", {
          allNews: response.articles,
          topic: "Trending",
          user: req.user
        });
      })
      .catch(err => {
        next(err);
      });
  });
  app.get("/trending/:page", (req, res, next) => {
    let pageToFind = Number(req.params.page);
    newsapi.v2
      .topHeadlines({ country: "us", page: pageToFind })
      .then(response => {
        res.json({ response: response.articles, user: req.user });
      })
      .catch(err => {
        res.json(err);
      });
  });
  app.get("/sports", (req, res, next) => {
    newsapi.v2
      .everything({ q: "sports" })
      .then(response => {
        response.articles.forEach(e => {
          let date = e.publishedAt;
          let modifiedDate = date.substring(0, 10);
          e.publishedAt = modifiedDate;
        });
        res.render("news", {
          allNews: response.articles,
          topic: "Sports",
          user: req.user
        });
      })
      .catch(err => {
        next(err);
      });
  });
  app.get("/:topic/:page", (req, res, next) => {
    let pageToFind = Number(req.params.page);
    let topic = req.params.topic;
    newsapi.v2
      .everything({ q: topic, page: pageToFind })
      .then(response => {
        res.json({ response: response.articles, user: req.user });
      })
      .catch(err => {
        res.json(err);
      });
  });
  app.get("/query", (req, res, next) => {
    let topic = req.query.searchFor;
    newsapi.v2
      .everything({ q: `${topic}` })
      .then(response => {
        User.find({
          $or: [
            { name: { $regex: `.*${topic}.*`, $options: `-i` } },
            { username: { $regex: `.*${topic}.*`, $options: `-i` } }
          ]
        })
          .then(userResponse => {
            if (req.user) {
              userResponse.forEach((e, i) => {
                if (req.user.following.includes(e._id)) {
                  e.isFollowing = true;
                }
                // }
              });
              userResponse.forEach((e, i) => {
                if (e._id.equals(req.user._id)) {
                  userResponse.splice(i, 1);
                }
                // }
              });
            }
            console.log(userResponse);
            response.articles.forEach(e => {
              let date = e.publishedAt;
              let modifiedDate = date.substring(0, 10);
              e.publishedAt = modifiedDate;
            });
            res.render("news", {
              allNews: response.articles,
              topic: `${topic}`,
              user: req.user,
              foundUsers: userResponse
            });
          })
          .catch(err => {
            next(err);
          });
      })
      .catch(err => {
        next(err);
      });
  });
  app.get("/health", (req, res, next) => {
    newsapi.v2
      .everything({ q: "health" })
      .then(response => {
        response.articles.forEach(e => {
          let date = e.publishedAt;
          let modifiedDate = date.substring(0, 10);
          e.publishedAt = modifiedDate;
        });
        res.render("news", {
          allNews: response.articles,
          topic: "Health",
          user: req.user
        });
      })
      .catch(err => {
        next(err);
      });
  });
  app.get("/politics", (req, res, next) => {
    newsapi.v2
      .everything({ q: "politics" })
      .then(response => {
        response.articles.forEach(e => {
          let date = e.publishedAt;
          let modifiedDate = date.substring(0, 10);
          e.publishedAt = modifiedDate;
        });
        res.render("news", {
          allNews: response.articles,
          topic: "Politics",
          user: req.user
        });
      })
      .catch(err => {
        next(err);
      });
  });
  app.get("/lifestyle", (req, res, next) => {
    newsapi.v2
      .everything({ q: "lifestyle" })
      .then(response => {
        response.articles.forEach(e => {
          let date = e.publishedAt;
          let modifiedDate = date.substring(0, 10);
          e.publishedAt = modifiedDate;
        });
        res.render("news", {
          allNews: response.articles,
          topic: "Lifestyle",
          user: req.user
        });
      })
      .catch(err => {
        next(err);
      });
  });
  app.get("/celebrities", (req, res, next) => {
    newsapi.v2
      .everything({ q: "celebrities" })
      .then(response => {
        response.articles.forEach(e => {
          let date = e.publishedAt;
          let modifiedDate = date.substring(0, 10);
          e.publishedAt = modifiedDate;
        });
        res.render("news", {
          allNews: response.articles,
          topic: "Celebrities",
          user: req.user
        });
      })
      .catch(err => {
        next(err);
      });
  });
  app.get("/tech", (req, res, next) => {
    newsapi.v2
      .everything({ q: "technology" })
      .then(response => {
        response.articles.forEach(e => {
          let date = e.publishedAt;
          let modifiedDate = date.substring(0, 10);
          e.publishedAt = modifiedDate;
        });
        res.render("news", {
          allNews: response.articles,
          topic: "Tech",
          user: req.user
        });
      })
      .catch(err => {
        next(err);
      });
  });
  app.get("/music", (req, res, next) => {
    newsapi.v2
      .everything({ q: "music" })
      .then(response => {
        console.log(response);
        response.articles.forEach(e => {
          let date = e.publishedAt;
          let modifiedDate = date.substring(0, 10);
          e.publishedAt = modifiedDate;
        });
        console.log(req.user);
        res.render("news", {
          allNews: response.articles,
          topic: "Music",
          user: req.user
        });
      })
      .catch(err => {
        next(err);
      });
  });

  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.post("/news/create", async (req, res, next) => {
    const {
      title,
      description,
      picture,
      author,
      articleUrl,
      articleDate
    } = req.body;
    try {
      const newArticle = await News.create({
        owner: req.user,
        title,
        description,
        picture,
        author,
        articleUrl,
        articleDate
      });
    } catch (err) {
      console.log(err);
    }
    //   .then((response)=>{
    //     res.json(response);
    // })
    //   .catch((err)=>{
    //     res.json(err);
    //   })
  });

  app.post("/news/delete", (req, res, next) => {
    News.findOneAndRemove({ title: req.body.title })
      .then(response => {
        res.json(response);
      })
      .catch(err => {
        res.json(err);
      });
  });

  app.post("/comment/create", async (req, res) => {
    const { title, content } = req.body;

    try {
      const getNew = await News.findOne({ title });
      const newComment = await Comment.create({
        user: req.user._id,
        article: getNew._id,
        content
      });

      getNew.comments.push(newComment._id);
      await getNew.save();

      res.json({
        ok: true,
        data: {
          user: req.user,
          message: "Comment submitted"
        }
      });
    } catch (err) {
      res.json({
        ok: false,
        data: "Something went wrong"
      });
    }
  });

  app.post("/likes/add", async (req, res) => {
    const { title } = req.body;
    try {
      await News.findOneAndUpdate(
        { title },
        { $push: { likes: req.user._id } }
      );

      res.json({
        ok: true,
        message: "Liked"
      });
    } catch (err) {
      console.log(err);
    }
  });

  app.post("/likes/remove", async (req, res) => {
    const { title } = req.body;

    try {
      await News.findOneAndUpdate(
        { title },
        { $pull: { likes: req.user._id } }
      );

      res.json({
        ok: true,
        message: "Disliked"
      });
    } catch (err) {
      console.log(err);
    }
  });
  app.post("/follow", (req, res, next) => {
    console.log("============================== ", req.body);
    const personToFollow = req.body.arrayIds[0];
    const personThatIsFollowing = req.body.arrayIds[1];
    User.findById(personToFollow)
      .then(person => {
        if (!req.user.following.includes(person._id)) {
          req.user.following.push(person._id);
          req.user
            .save()
            .then(response => {
              if (person.follwers) {
                person.followers.push(req.user._id);
              } else {
                person.followers = [];
                person.followers.push(req.user._id);
              }
              person
                .save()
                .then(saveBoth => {
                  next();
                })
                .catch(err => {
                  console.log(err);

                  next(err);
                });
            })
            .catch(err => {
              console.log(err);

              next(err);
            });
        } else {
          req.user.following.pull(person._id);
          req.user
            .save()
            .then(response => {
              person.followers.pull(req.user._id);
              person
                .save()
                .then(saveBoth => {
                  next();
                })
                .catch(err => {
                  console.log(err);
                  next(err);
                });
            })
            .catch(err => {
              console.log(err);
              next(err);
            });
        }
      })
      .catch(err => {
        console.log(err);
        next(err);
      });

    //   console.log(userID);
    //   if(!userID) {

    //     await User.findByIdAndUpdate(personToFollow,{$push: {followers: personThatIsFollowing}})
    //     await User.findByIdAndUpdate(personThatIsFollowing,{$push: {following: personToFollow}})

    //   }
    //   res.json({
    //     ok: true,
    //     message: 'followed'
    //   })
    // } catch(err){
    //   console.log(err);
    // }
  });
  app.get("/:hashtag", (req, res, next) => {
    newsapi.v2
      .everything({ q: `${req.params.hashtag}` })
      .then(response => {
        response.articles.forEach(e => {
          let date = e.publishedAt;
          let modifiedDate = date.substring(0, 10);
          e.publishedAt = modifiedDate;
        });
        res.render("news", {
          allNews: response.articles,
          topic: `${req.params.hashtag}`,
          user: req.user
        });
      })
      .catch(err => {
        next(err)
      })
  })


  app.post('/profile/edit', async (req, res) => {
    const { name, username } = req.body;
    let body = {
      name,
      username
    }

    if(req.body.webcamImg) {
      cloudinary.v2.uploader.upload(`data:image/jpeg;base64,${req.body.webcamImg.replace(/(\r\n|\n|\r)/gm,"")}`, {
          overwrite: true,
          invalidate: true,
          width: 810, 
          height: 456, 
          crop: "fill"
      },async function(error, result) {
        if(error) {
          next(error)
        }
  
        await User.findByIdAndUpdate(req.user._id, {...body, img: result.url});
        res.redirect('/profile')
      });
    } else if(req.body.fileImg){
      cloudinary.v2.uploader.upload(req.body.fileImg, async function(error, result) {
        if(error) {
          next(error)
        }
        
        await User.findByIdAndUpdate(req.user._id, {...body, img: result.url});
        res.redirect('/profile')
      });
    } else {
      console.log('hey')
      await User.findByIdAndUpdate(req.user._id, body)
      res.redirect('/profile')
    }
  });
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
}
