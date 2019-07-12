const LocalStrategy = require('passport-local');
const User = require('../models/User');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

module.exports = function(passport) {
    passport.serializeUser(function (user, done) {
        console.log('User serialize: ', user)
        done(null, user.id)
    })
 
    passport.deserializeUser(function (id, done) {
        console.log('ID deserialize: ', id)
        User.findById(id, function (err, user) {
            done(err, user)
        });
    });

    // For Signup
    passport.use('local-signup', new LocalStrategy({
        passReqToCallback: true
    },
    async function(req, username, password, done){
        const { name, email } = req.body;

        try {
            const userDB = await User.findOne({$or: [{email}, {username}]}).exec()
        
            if(userDB) {
                if(userDB.username === username && userDB.email === email) {
                    return done(null, false, req.flash('wrongEmailAndUsername', true))
                } else if(userDB.username === username) {
                    return done(null, false, req.flash('wrongUsername', true))
                } else if(userDB.email === email) {
                    return done(null, false, req.flash('wrongEmail', true))
                }
        
            } else {
        
                let newUser = new User()
                newUser.name = name;
                newUser.username = username;
                newUser.email = email;
                newUser.password = newUser.generateHash(password);
              
                await newUser.save()
                return done(null, newUser)

            }
        
        } catch(err) {
            console.log(err)
        }
    }))

    // For Login
    passport.use('local-login', new LocalStrategy({
        usernameField: 'name',
        passwordField: 'password',
        passReqToCallback: true
    }, async function(req, username, password, done) {
        const { email } = req.body;

        try {
            const userDB = await User.findOne({$or: [{email}, {username}]}).exec()

            if(!userDB) {
                return done(null, false, req.flash('loginMessage', 'User not found. Please Signup'))
            }

            if(!userDB.validatePassword(password)) {
                return done(null, false, req.flash('loginMessage', 'Incorrect email or password'))
            }

            return done(null, userDB)
        } catch(err) {
            done(err)
        }
    }))

    // Linkedin OAuth
    passport.use(new LinkedInStrategy({
        clientID: process.env.LINKEDIN_KEY,
        clientSecret: process.env.LINKEDIN_SECRET,
        callbackURL: "/auth/linkedin/callback",
        scope: ['r_emailaddress', 'r_liteprofile'],
    }, function(accessToken, refreshToken, profile, done) {
        console.log(profile)
    }));
}